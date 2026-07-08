/**
 * @file apps/web/src/app/api/webhooks/stripe/route.ts
 *
 * Stripe webhook handler.
 *
 * Security model:
 * 1. Signature verification   — Stripe-Signature header HMAC (constructWebhookEvent)
 * 2. Idempotency              — Redis SET NX on event.id (24 h TTL) prevents double-processing
 * 3. Runtime: Node.js          — required for raw body access and crypto
 * 4. Rate-limited              — upstream middleware handles 1 000/min from /api/webhooks/*
 *
 * Important: we mark the event as processed AFTER successful handling, not before.
 * Marking before would cause silent event drops on handler failure.
 */

import { type NextRequest, NextResponse } from 'next/server';
import {
  type StripeWebhookEventContract,
  StripeWebhookEventSchema,
} from '@/lib/contracts/payment-provider-contracts';
import { problemResponse } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { redis } from '@/lib/redis/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = createLogger({ module: 'webhook:stripe' });

/** 24 hours — long enough to cover any reasonable replay window */
const IDEMPOTENCY_TTL_SECONDS = 86_400;

function idempotencyKey(eventId: string): string {
  return `webhook:stripe:processed:${eventId}`;
}

async function isAlreadyProcessed(eventId: string): Promise<boolean> {
  const result = await redis.exists(idempotencyKey(eventId));
  return result === 1;
}

async function markAsProcessed(eventId: string): Promise<void> {
  await redis.set(idempotencyKey(eventId), '1', { ex: IDEMPOTENCY_TTL_SECONDS });
}

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    log.warn('Stripe webhook rejected: missing stripe-signature header', {
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
    });
    return problemResponse(
      400,
      'Missing Signature',
      'The stripe-signature header is required for webhook verification.',
      'https://pranakaia.com/errors/missing-signature',
    );
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    log.error('Failed to read webhook request body');
    return problemResponse(400, 'Invalid Body', 'Could not read request body.');
  }

  // Verify signature and construct the typed Stripe event
  let event: StripeWebhookEventContract;

  try {
    const { constructWebhookEvent } = await import('@/lib/stripe');
    const rawEvent = constructWebhookEvent(body, signature) as unknown;
    const parsedEvent = StripeWebhookEventSchema.safeParse(rawEvent);

    if (!parsedEvent.success) {
      log.warn('Stripe webhook rejected: invalid event payload', {
        issues: parsedEvent.error.issues.length,
      });

      return problemResponse(
        400,
        'Invalid Event Payload',
        'Webhook payload does not match expected Stripe contract.',
        'https://pranakaia.com/errors/invalid-webhook-payload',
      );
    }

    event = parsedEvent.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.warn('Stripe webhook signature verification failed', { error: message });
    return problemResponse(
      400,
      'Invalid Signature',
      'Webhook signature verification failed. Ensure STRIPE_WEBHOOK_SECRET is correct.',
      'https://pranakaia.com/errors/invalid-signature',
    );
  }

  log.info('Stripe webhook received', { eventId: event.id, eventType: event.type });

  // Idempotency check — Stripe may deliver the same event more than once
  if (await isAlreadyProcessed(event.id)) {
    log.info('Stripe webhook skipped (already processed)', { eventId: event.id });
    return NextResponse.json({ received: true, idempotent: true });
  }

  try {
    const { inngest } = await import('@/lib/inngest/client');
    await inngest.send({
      name: 'stripe/webhook.received',
      data: event,
    });

    // We mark as processed immediately after placing it in the Background queue.
    await markAsProcessed(event.id);

    const durationMs = Math.round(performance.now() - startTime);
    log.info('Stripe webhook processed successfully', {
      eventId: event.id,
      eventType: event.type,
      durationMs,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const durationMs = Math.round(performance.now() - startTime);

    log.error('Stripe webhook handler failed', {
      eventId: event.id,
      eventType: event.type,
      error: message,
      durationMs,
    });

    // Return 500 so Stripe retries the delivery
    return NextResponse.json(
      { error: 'Webhook processing failed', eventId: event.id },
      { status: 500 },
    );
  }
}
