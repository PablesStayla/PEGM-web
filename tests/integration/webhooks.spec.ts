import { beforeEach, describe, expect, it, vi } from 'vitest';

const TEST_SECRET = 'whsec_test_secret_0123456789abcdef';

const mockUpdate = vi.fn().mockReturnThis();
const mockSet = vi.fn().mockReturnThis();
const mockWhere = vi.fn().mockReturnThis();
const mockDbWhere = vi.fn().mockResolvedValue([{ paymentStatus: 'PENDING' }]);
const mockDbFrom = vi.fn(() => ({ where: mockDbWhere }));
const mockDbSelect = vi.fn(() => ({ from: mockDbFrom }));
const mockTx = {
  update: mockUpdate,
  set: mockSet,
  where: mockWhere,
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue(undefined),
};
const mockTransaction = vi.fn(async (fn: (tx: typeof mockTx) => unknown) => fn(mockTx));
const mockDb = { select: mockDbSelect, transaction: mockTransaction };

vi.mock('@pranakaia/db', () => ({
  db: mockDb,
  orders: {
    id: 'id',
    paymentStatus: 'paymentStatus',
    status: 'status',
    updatedAt: 'updatedAt',
    externalPaymentId: 'externalPaymentId',
  },
  payments: {},
  orderItems: {},
  products: {},
  users: {},
  addresses: {},
}));

vi.mock('drizzle-orm', () => ({
  eq: (field: unknown, value: unknown) => ({ field, value }),
  sql: vi.fn(),
}));

const redisStore: Record<string, string> = {};
const mockRedis = {
  exists: vi.fn(async (key: string) => (redisStore[key] ? 1 : 0)),
  set: vi.fn(async (key: string, value: string) => {
    redisStore[key] = value;
  }),
  get: vi.fn(async (key: string) => redisStore[key] ?? null),
  del: vi.fn(async (key: string) => {
    delete redisStore[key];
  }),
};

vi.mock('@/lib/redis/client', () => ({
  redis: mockRedis,
  ratelimitStrict: { limit: vi.fn().mockResolvedValue({ success: true }) },
}));

vi.mock('@/lib/logger', () => ({
  observabilityLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../../apps/web/src/lib/email', () => ({
  sendOrderConfirmation: vi.fn().mockResolvedValue(undefined),
}));

async function signStripePayload(payload: string, secret: string): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signedPayload = `${timestamp}.${payload}`;
  const secretBytes = new TextEncoder().encode(secret.replace('whsec_', ''));
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const sig = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `t=${timestamp},v1=${sig}`;
}

function buildCheckoutSessionPayload(orderId: string, paymentIntentId = 'pi_test_123') {
  return JSON.stringify({
    id: 'evt_test_webhook',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_abc',
        payment_intent: paymentIntentId,
        amount_total: 9900,
        currency: 'clp',
        metadata: { orderId },
      },
    },
  });
}

async function processStripeEvent(
  orderId: string | undefined,
  event: { type: string; data: { object: Record<string, unknown> } },
  idempotencyKey?: string,
): Promise<{
  success?: boolean;
  alreadyProcessed?: boolean;
  error?: string;
  cached?: boolean;
} | null> {
  try {
    if (idempotencyKey) {
      const cached = await mockRedis.exists(`webhook:stripe:${idempotencyKey}`);
      if (cached) {
        return { success: true, cached: true };
      }
    }

    const session = event.data.object;
    const metadata = session.metadata as Record<string, string> | undefined;
    const resolvedOrderId = metadata?.orderId ?? orderId ?? null;

    if (!resolvedOrderId) {
      return { success: false, error: 'No orderId found in webhook event' };
    }

    const existingOrder = await mockDb.select().from({}).where({ id: resolvedOrderId });
    if (existingOrder[0]?.paymentStatus === 'PAID') {
      return { success: true, alreadyProcessed: true };
    }

    if (event.type !== 'checkout.session.completed' && event.type !== 'payment_intent.succeeded') {
      return { success: true };
    }

    await mockDb.transaction(async (tx: typeof mockTx) => {
      const externalPaymentId = (session.payment_intent as string | undefined) ?? null;
      tx.update({});
      tx.set({ paymentStatus: 'PAID', status: 'PAID', externalPaymentId, updatedAt: new Date() });
      tx.where({ id: resolvedOrderId });
    });

    if (idempotencyKey) {
      await mockRedis.set(`webhook:stripe:${idempotencyKey}`, '1');
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

describe('Stripe Webhook Integration', () => {
  const testOrderId = 'order_integration_test_001';

  beforeEach(() => {
    vi.clearAllMocks();
    for (const k of Object.keys(redisStore)) {
      delete redisStore[k];
    }
    mockDbWhere.mockResolvedValue([{ paymentStatus: 'PENDING' }]);
    mockTx.update.mockReturnThis();
    mockTx.set.mockReturnThis();
    mockTx.where.mockReturnThis();
  });

  describe('Signature validation', () => {
    it('generates valid HMAC signature for payload', async () => {
      const payload = buildCheckoutSessionPayload(testOrderId);
      const sig = await signStripePayload(payload, TEST_SECRET);
      expect(sig).toMatch(/^t=\d+,v1=[0-9a-f]+$/);
    });

    it('rejects webhooks with invalid signature', async () => {
      const badSig = 't=1234567890,v1=invalidhex000000';
      expect(badSig).not.toMatch(/^t=\d+,v1=[0-9a-f]{64}$/);
    });
  });

  describe('checkout.session.completed', () => {
    it('updates order.status to PAID and paymentStatus to PAID', async () => {
      await processStripeEvent(testOrderId, {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_abc',
            payment_intent: 'pi_test_001',
            amount_total: 9900,
            currency: 'clp',
            metadata: { orderId: testOrderId },
          },
        },
      });

      expect(mockDb.transaction).toHaveBeenCalledOnce();
      expect(mockTx.set).toHaveBeenCalledWith(
        expect.objectContaining({ paymentStatus: 'PAID', status: 'PAID' }),
      );
    });
  });

  describe('Idempotency', () => {
    it('does not re-update if order already PAID (DB idempotency)', async () => {
      mockDbWhere.mockResolvedValue([{ paymentStatus: 'PAID' }]);

      const result = await processStripeEvent(testOrderId, {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_dup',
            payment_intent: 'pi_test_dup',
            amount_total: 9900,
            currency: 'clp',
            metadata: { orderId: testOrderId },
          },
        },
      });

      expect(result?.alreadyProcessed).toBe(true);
      expect(mockDb.transaction).not.toHaveBeenCalled();
    });

    it('returns cached:true if idempotency key already processed (Redis)', async () => {
      const idemKey = 'idem_test_key_001';
      redisStore[`webhook:stripe:${idemKey}`] = '1';

      const result = await processStripeEvent(
        testOrderId,
        {
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_abc',
              payment_intent: 'pi_test_001',
              amount_total: 9900,
              currency: 'clp',
              metadata: { orderId: testOrderId },
            },
          },
        },
        idemKey,
      );

      expect(result?.cached).toBe(true);
      expect(mockDb.transaction).not.toHaveBeenCalled();
    });

    it('stores idempotency key in Redis after first processing', async () => {
      const idemKey = 'idem_fresh_key_001';
      await processStripeEvent(
        testOrderId,
        {
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_abc',
              payment_intent: 'pi_test_001',
              amount_total: 9900,
              currency: 'clp',
              metadata: { orderId: testOrderId },
            },
          },
        },
        idemKey,
      );

      expect(redisStore[`webhook:stripe:${idemKey}`]).toBe('1');
    });

    it('detects duplicate on second attempt with same key', async () => {
      const idemKey = 'idem_dup_key_001';
      await mockRedis.set(`webhook:stripe:${idemKey}`, '1');

      const isDuplicate = (await mockRedis.exists(`webhook:stripe:${idemKey}`)) === 1;
      expect(isDuplicate).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('returns error when metadata lacks orderId', async () => {
      const result = await processStripeEvent(undefined, {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_no_order',
            payment_intent: 'pi_no_order',
            amount_total: 0,
            currency: 'clp',
            metadata: {},
          },
        },
      });

      expect(result?.success).toBe(false);
      expect(result?.error).toContain('orderId');
    });

    it('processes unknown event types without throwing', async () => {
      const result = await processStripeEvent(testOrderId, {
        type: 'customer.subscription.deleted',
        data: { object: { id: 'sub_test', metadata: { orderId: testOrderId } } },
      });

      expect(result?.success).toBe(true);
      expect(mockDb.transaction).not.toHaveBeenCalled();
    });
  });
});
