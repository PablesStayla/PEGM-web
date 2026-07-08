/**
 * @file apps/web/src/app/api/webhooks/supplier/route.ts
 *
 * Supplier (dropshipping) webhook handler.
 *
 * Responsibilities:
 *   1. Validate HMAC-SHA256 signature (X-Signature header)
 *   2. Parse payload with Zod
 *   3. Idempotency guard via Redis (eventId, 24h TTL)
 *   4. Update order status in DB via Drizzle ORM
 *
 * Required env: SUPPLIER_WEBHOOK_SECRET
 */

import { db, orders } from '@pranakaia/infrastructure/db';
import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';
import { CommonErrors } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { redis } from '@/lib/redis/client';
import { rateLimit } from '@/lib/security/rate-limit-redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = createLogger({ module: 'webhook:supplier' });

const IDEMPOTENCY_TTL = 86_400; // 24 hours

// ── Schema ────────────────────────────────────────────────────────────────────

const supplierWebhookSchema = z.object({
  eventId: z.string().min(1),
  providerOrderId: z.string().min(1),
  status: z.enum(['SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED', 'RETURNED']),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  notes: z.string().optional(),
});

type SupplierPayload = z.infer<typeof supplierWebhookSchema>;

const STATUS_MAP: Record<SupplierPayload['status'], string> = {
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  RETURNED: 'CANCELLED',
};

// ── HMAC-SHA256 verifier (timing-safe) ───────────────────────────────────────

async function verifyHmacSignature(
  rawBody: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sigBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
    const computed = Array.from(new Uint8Array(sigBytes))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const expected = signature.replace(/^sha256=/, '');

    if (computed.length !== expected.length) {
      return false;
    }

    // Constant-time XOR comparison (timing-safe)
    let diff = 0;
    for (let i = 0; i < computed.length; i++) {
      diff |= computed.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

// ── POST /api/webhooks/supplier ───────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const start = performance.now();

  // Rate limit
  const rl = await rateLimit(request, 'webhooks:supplier:POST', 200, 60);
  if (!rl.allowed) {
    return CommonErrors.TooManyRequests();
  }

  const secret = env.SUPPLIER_WEBHOOK_SECRET;
  if (!secret) {
    log.error('SUPPLIER_WEBHOOK_SECRET is not configured');
    return CommonErrors.InternalServerError('Server misconfiguration.');
  }

  // Read body
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return CommonErrors.BadRequest('Could not read request body.');
  }

  // Verify HMAC signature
  const signature = request.headers.get('x-signature') ?? '';
  const isValid = await verifyHmacSignature(rawBody, signature, secret);
  if (!isValid) {
    log.warn('Supplier webhook: invalid HMAC signature', {
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
    });
    return CommonErrors.Unauthorized('Webhook signature verification failed.');
  }

  // Parse payload
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return CommonErrors.BadRequest('Request body must be valid JSON.');
  }

  const parsed = supplierWebhookSchema.safeParse(body);
  if (!parsed.success) {
    log.warn('Supplier webhook: invalid payload', { issues: parsed.error.issues.length });
    return CommonErrors.UnprocessableEntity(
      `Invalid payload: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
    );
  }

  const { eventId, providerOrderId, status, trackingNumber, trackingUrl, carrier } = parsed.data;

  log.info('Supplier webhook received', { eventId, providerOrderId, status });

  // Idempotency — skip already-processed events
  const idempKey = `webhook:supplier:${eventId}`;
  const alreadyProcessed = await redis.exists(idempKey);
  if (alreadyProcessed === 1) {
    log.info('Supplier webhook: idempotent skip', { eventId });
    return NextResponse.json({ received: true, idempotent: true });
  }

  try {
    // Find order by provider_order_id
    const [order] = await db
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(eq(orders.providerOrderId, providerOrderId))
      .limit(1);

    if (!order) {
      log.warn('Supplier webhook: order not found', { providerOrderId, eventId });
      // Return 200 — supplier should not retry on missing orders
      return NextResponse.json({ received: true, warning: 'order_not_found' });
    }

    const newStatus = STATUS_MAP[status];

    if (order.status !== newStatus) {
      await db
        .update(orders)
        .set({
          status: newStatus as (typeof orders.$inferInsert)['status'],
          ...(trackingNumber ? { trackingNumber } : {}),
          ...(trackingUrl ? { trackingUrl } : {}),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      const durationMs = Math.round(performance.now() - start);
      log.info('Supplier webhook: order status updated', {
        orderId: order.id,
        from: order.status,
        to: newStatus,
        carrier,
        durationMs,
      });
    } else {
      log.info('Supplier webhook: order already in target status', {
        orderId: order.id,
        status: newStatus,
      });
    }

    // Mark as processed only after successful handling
    await redis.set(idempKey, '1', { ex: IDEMPOTENCY_TTL });

    return NextResponse.json({ received: true, orderId: order.id, status: newStatus });
  } catch (error) {
    const durationMs = Math.round(performance.now() - start);
    log.error('Supplier webhook: handler failed', {
      eventId,
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });
    // Return 500 so the supplier retries
    return NextResponse.json({ error: 'Processing failed', eventId }, { status: 500 });
  }
}
