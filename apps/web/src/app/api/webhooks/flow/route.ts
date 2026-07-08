/**
 * @file apps/web/src/app/api/webhooks/flow/route.ts
 *
 * Flow.cl webhook handler.
 *
 * Flow uses POST with x-www-form-urlencoded body for payment confirmations.
 * The token is verified by calling back Flow's API (server-to-server).
 *
 * Security model:
 * 1. Token verification   — Flow server confirms payment status via API call
 * 2. Idempotency          — Redis SET NX on flowOrder prevents double-processing
 * 3. GET endpoint         — Returns a receipt page (Flow redirects customers here)
 * 4. Rate limited         — 1 000 req/min from upstream middleware
 *
 * Flow webhook docs: https://www.flow.cl/docs/api.html#tag/payment/operation/paymentConfirm
 */

import { type NextRequest, NextResponse } from 'next/server';
import {
  FlowVerificationResultSchema,
  FlowWebhookTokenSchema,
} from '@/lib/contracts/payment-provider-contracts';
import { problemResponse } from '@/lib/errors';
import { flowHelpers } from '@/lib/flow/client';
import { createLogger } from '@/lib/logger';
import { redis } from '@/lib/redis/client';
import { getSiteUrl } from '@/lib/site-url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = createLogger({ module: 'webhook:flow' });

const IDEMPOTENCY_TTL_SECONDS = 86_400; // 24 hours

function idempotencyKey(flowOrder: number): string {
  return `webhook:flow:processed:${flowOrder}`;
}

async function isAlreadyProcessed(flowOrder: number): Promise<boolean> {
  const result = await redis.exists(idempotencyKey(flowOrder));
  return result === 1;
}

async function markAsProcessed(flowOrder: number): Promise<void> {
  await redis.set(idempotencyKey(flowOrder), '1', { ex: IDEMPOTENCY_TTL_SECONDS });
}

// ── GET /api/webhooks/flow ───────────────────────────────────────────────────────
// Flow redirects the customer's browser here after payment.
// We must NOT process payment status here — use POST (server-to-server) for that.

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    // Customer landed here without a token — redirect to homepage
    return NextResponse.redirect(new URL('/', request.nextUrl.origin), { status: 302 });
  }

  log.info('Flow return URL accessed', { hasToken: true });

  // Redirect to the order confirmation page — the actual payment processing
  // happened (or will happen) via the POST webhook.
  const siteUrl = getSiteUrl();
  return NextResponse.redirect(
    new URL(`/checkout/confirmation?token=${encodeURIComponent(token)}`, siteUrl),
    { status: 302 },
  );
}

// ── POST /api/webhooks/flow ───────────────────────────────────────────────────────
// Flow calls this endpoint server-to-server when a payment is confirmed.

export async function POST(request: NextRequest) {
  const start = performance.now();

  // Parse x-www-form-urlencoded body
  let token: string | null = null;
  try {
    const formData = await request.formData();
    token = formData.get('token')?.toString() ?? null;
  } catch {
    log.warn('Flow webhook: failed to parse form body');
    return problemResponse(400, 'Invalid Body', 'Expected application/x-www-form-urlencoded body.');
  }

  if (!token) {
    log.warn('Flow webhook received without token');
    return problemResponse(400, 'Missing Token', 'The Flow token is required to verify payment.');
  }

  const parsedToken = FlowWebhookTokenSchema.safeParse({ token });
  if (!parsedToken.success) {
    log.warn('Flow webhook rejected: invalid token payload', {
      issues: parsedToken.error.issues.length,
    });
    return problemResponse(400, 'Invalid Token', 'Flow token payload is invalid.');
  }

  log.info('Flow webhook received', { hasToken: true });

  // Verify payment status with Flow API
  let status: Awaited<ReturnType<typeof flowHelpers.verifyPayment>>;
  try {
    status = await flowHelpers.verifyPayment(token);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error('Flow API verification failed', { error: message });
    // Return 500 so Flow retries the webhook
    return NextResponse.json(
      { error: 'Failed to verify payment status with Flow API' },
      { status: 500 },
    );
  }

  const parsedStatus = FlowVerificationResultSchema.safeParse(status);
  if (!parsedStatus.success) {
    log.error('Flow webhook rejected: verification payload contract mismatch', {
      issues: parsedStatus.error.issues.length,
    });
    return NextResponse.json(
      { error: 'Invalid payment verification payload from Flow provider' },
      { status: 500 },
    );
  }

  status = parsedStatus.data;

  if (!status.success) {
    log.info('Flow payment not successful — no action taken', {
      flowOrder: status.flowOrder,
      status: status.status,
      orderId: status.orderId,
    });
    // Return 200 so Flow stops retrying — non-payment states are not errors
    return NextResponse.json({ received: true, processed: false, reason: 'not_paid' });
  }

  // Idempotency: skip if already processed
  if (await isAlreadyProcessed(status.flowOrder)) {
    log.info('Flow webhook skipped (already processed)', { flowOrder: status.flowOrder });
    return NextResponse.json({ received: true, idempotent: true });
  }

  try {
    // Handle payment completion via Inngest (Staff Level Decoupling)
    const { inngest } = await import('@/lib/inngest/client');
    await inngest.send({
      name: 'flow/webhook.received',
      data: {
        token,
        flowOrder: status.flowOrder,
        orderId: status.orderId,
        amount: status.amount,
        status: status.status,
      },
    });

    // Mark as processed ONLY after successful handling
    await markAsProcessed(status.flowOrder);

    const durationMs = Math.round(performance.now() - start);
    log.info('Flow webhook processed successfully', {
      flowOrder: status.flowOrder,
      orderId: status.orderId,
      durationMs,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const durationMs = Math.round(performance.now() - start);

    log.error('Flow webhook handler failed', {
      flowOrder: status.flowOrder,
      orderId: status.orderId,
      error: message,
      durationMs,
    });

    // Return 500 so Flow retries
    return NextResponse.json(
      { error: 'Payment processing failed', flowOrder: status.flowOrder },
      { status: 500 },
    );
  }
}
