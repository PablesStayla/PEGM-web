import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetEnvCache } from '@/lib/env';

const createSessionMock = vi.hoisted(() => vi.fn());
const StripeMock = vi.hoisted(
  () =>
    class {
      checkout = {
        sessions: {
          create: createSessionMock,
        },
      };
    },
);

vi.mock('stripe', () => ({
  default: StripeMock,
}));

vi.mock('@/lib/site-url', () => ({
  getSiteUrl: () => 'https://shop.pranakaia.test',
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('StripePaymentGateway', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('throws when STRIPE_SECRET_KEY is missing', async () => {
    Reflect.deleteProperty(process.env, 'STRIPE_SECRET_KEY');
    resetEnvCache();

    const { StripePaymentGateway } = await import('./stripe-payment-gateway');
    expect(() => new StripePaymentGateway()).toThrow('STRIPE_SECRET_KEY is required');
  });

  it('rejects session creation when items array is empty', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    resetEnvCache();

    const { StripePaymentGateway } = await import('./stripe-payment-gateway');
    const gateway = new StripePaymentGateway();

    await expect(
      gateway.createSession({
        orderId: 'ord-empty',
        email: 'test@pranakaia.com',
        amount: 10,
        currency: 'USD',
        items: [],
      }),
    ).rejects.toThrow('without items');
  });

  it('rejects session creation when amount does not match line items', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    resetEnvCache();

    const { StripePaymentGateway } = await import('./stripe-payment-gateway');
    const gateway = new StripePaymentGateway();

    await expect(
      gateway.createSession({
        orderId: 'ord-mismatch',
        email: 'test@pranakaia.com',
        amount: 9.99,
        currency: 'USD',
        items: [{ name: 'Nutriente', price: 9.99, quantity: 2, images: [] }],
      }),
    ).rejects.toThrow('Order amount mismatch');
  });

  it('rejects invalid currency and quantity values', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    resetEnvCache();

    const { StripePaymentGateway } = await import('./stripe-payment-gateway');
    const gateway = new StripePaymentGateway();

    await expect(
      gateway.createSession({
        orderId: 'ord-invalid-currency',
        email: 'test@pranakaia.com',
        amount: 100,
        currency: '  ',
        items: [{ name: 'Item', price: 100, quantity: 1, images: [] }],
      }),
    ).rejects.toThrow('Currency is required');

    await expect(
      gateway.createSession({
        orderId: 'ord-invalid-qty',
        email: 'test@pranakaia.com',
        amount: 100,
        currency: 'USD',
        items: [{ name: 'Item', price: 1, quantity: 0, images: [] }],
      }),
    ).rejects.toThrow('Invalid quantity');
  });

  it('rejects charges below Stripe minimum', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    resetEnvCache();

    const { StripePaymentGateway } = await import('./stripe-payment-gateway');
    const gateway = new StripePaymentGateway();

    await expect(
      gateway.createSession({
        orderId: 'ord-too-low',
        email: 'test@pranakaia.com',
        amount: 0.1,
        currency: 'USD',
        items: [{ name: 'Item', price: 0.1, quantity: 1, images: [] }],
      }),
    ).rejects.toThrow('minimum charge');
  });

  it('rejects invalid total amount values', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    resetEnvCache();

    const { StripePaymentGateway } = await import('./stripe-payment-gateway');
    const gateway = new StripePaymentGateway();

    await expect(
      gateway.createSession({
        orderId: 'ord-invalid-amount',
        email: 'test@pranakaia.com',
        amount: 0,
        currency: 'USD',
        items: [{ name: 'Item', price: 10, quantity: 1, images: [] }],
      }),
    ).rejects.toThrow('finite number greater than 0');
  });

  it('creates a session using idempotency key and normalized amounts', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    resetEnvCache();

    createSessionMock.mockResolvedValueOnce({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/session/cs_test_123',
    });

    const { StripePaymentGateway } = await import('./stripe-payment-gateway');
    const gateway = new StripePaymentGateway();

    const result = await gateway.createSession({
      orderId: 'ord-1',
      email: 'test@pranakaia.com',
      amount: 19.98,
      currency: 'USD',
      items: [
        { name: 'Kit LED', price: 9.99, quantity: 2, images: ['https://img.test/kit-led.jpg'] },
      ],
      metadata: { source: 'test-suite' },
    });

    expect(result).toEqual({
      url: 'https://checkout.stripe.com/session/cs_test_123',
      sessionId: 'cs_test_123',
    });

    const [payload, options] = createSessionMock.mock.calls[0] as [
      {
        line_items: Array<{
          price_data: { unit_amount: number; currency: string };
          quantity: number;
        }>;
      },
      { idempotencyKey: string },
    ];

    expect(payload.line_items[0]?.price_data.unit_amount).toBe(999);
    expect(payload.line_items[0]?.price_data.currency).toBe('usd');
    expect(options.idempotencyKey).toBe('checkout:ord-1');
  });

  it('fails when Stripe returns a session without URL', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    resetEnvCache();

    createSessionMock.mockResolvedValueOnce({
      id: 'cs_without_url',
      url: null,
    });

    const { StripePaymentGateway } = await import('./stripe-payment-gateway');
    const gateway = new StripePaymentGateway();

    await expect(
      gateway.createSession({
        orderId: 'ord-no-url',
        email: 'test@pranakaia.com',
        amount: 50,
        currency: 'CLP',
        items: [{ name: 'Sustrato', price: 50, quantity: 1, images: [] }],
      }),
    ).rejects.toThrow('without URL');
  });

  it('propagates Stripe API errors', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    resetEnvCache();

    createSessionMock.mockRejectedValueOnce(new Error('stripe unavailable'));

    const { StripePaymentGateway } = await import('./stripe-payment-gateway');
    const gateway = new StripePaymentGateway();

    await expect(
      gateway.createSession({
        orderId: 'ord-stripe-error',
        email: 'test@pranakaia.com',
        amount: 100,
        currency: 'CLP',
        items: [{ name: 'Fertilizante', price: 100, quantity: 1, images: [] }],
      }),
    ).rejects.toThrow('stripe unavailable');
  });

  it('handles non-Error rejections from Stripe API', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    resetEnvCache();

    createSessionMock.mockRejectedValueOnce('boom');

    const { StripePaymentGateway } = await import('./stripe-payment-gateway');
    const gateway = new StripePaymentGateway();

    await expect(
      gateway.createSession({
        orderId: 'ord-non-error-rejection',
        email: 'test@pranakaia.com',
        amount: 100,
        currency: 'CLP',
        items: [{ name: 'Fertilizante', price: 100, quantity: 1, images: [] }],
      }),
    ).rejects.toBe('boom');
  });
});
