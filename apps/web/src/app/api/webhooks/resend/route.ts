/**
 * @file apps/web/src/app/api/webhooks/resend/route.ts
 *
 * Resend email webhook handler.
 * Verifies Svix HMAC-SHA256 signatures and handles email delivery events.
 *
 * Events handled:
 *   email.bounced    — mark user for review, stop sending
 *   email.complained — immediate unsubscribe (SPAM complaint)
 *   email.delivered  — analytics tracking
 *
 * Svix signature spec: https://docs.svix.com/receiving/verifying-payloads/how-manual
 */

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { env, isProd } from '@/lib/env';
import { problemResponse } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { NotificationService } from '@/lib/services/notification-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = createLogger({ module: 'webhook:resend' });

// ── Svix HMAC-SHA256 signature verifier ──────────────────────────────────────
// Implements the Svix v1 signature scheme used by Resend.

async function verifySvixSignature(
  rawBody: string,
  msgId: string,
  msgTimestamp: string,
  msgSignature: string,
  secret: string,
): Promise<boolean> {
  // Reject replays older than 5 minutes
  const now = Math.floor(Date.now() / 1000);
  const ts = Number.parseInt(msgTimestamp, 10);
  if (Number.isNaN(ts) || Math.abs(now - ts) > 300) {
    log.warn('Resend webhook replay protection triggered', { ts, now });
    return false;
  }

  const signedContent = `${msgId}.${msgTimestamp}.${rawBody}`;
  const secretBytes = Uint8Array.from(atob(secret.replace('whsec_', '')), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedContent));
  const computedB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));

  // Header may contain multiple signatures separated by spaces
  return msgSignature.split(' ').some((s) => s === `v1,${computedB64}`);
}

// ── POST /api/webhooks/resend ─────────────────────────────────────────────────

export async function POST(req: Request) {
  const start = performance.now();
  const rawBody = await req.text();
  const h = await headers();

  const msgId = h.get('svix-id') ?? '';
  const msgTimestamp = h.get('svix-timestamp') ?? '';
  const msgSignature = h.get('svix-signature') ?? '';
  const secret = env.RESEND_WEBHOOK_SECRET ?? '';

  // Signature verification — never skip in production
  if (secret) {
    const valid = await verifySvixSignature(rawBody, msgId, msgTimestamp, msgSignature, secret);
    if (!valid) {
      log.warn('Resend webhook signature verification failed', { msgId });
      return problemResponse(401, 'Unauthorized', 'Webhook signature is invalid.');
    }
  } else if (isProd()) {
    // RESEND_WEBHOOK_SECRET is required in production — fail closed
    log.error('RESEND_WEBHOOK_SECRET is not set in production — rejecting webhook');
    return problemResponse(500, 'Server Misconfiguration', 'Webhook secret is not configured.');
  } else {
    log.warn('RESEND_WEBHOOK_SECRET not set — skipping signature verification (dev only)');
  }

  let body: { type: string; data: { to?: string[] } };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return problemResponse(400, 'Bad Request', 'Request body must be valid JSON.');
  }

  const { type, data } = body;
  const email = data?.to?.[0] ?? 'unknown';

  log.info('Resend webhook received', { type, msgId });

  try {
    switch (type) {
      case 'email.bounced':
        log.warn('Email bounced — marking user for review', { email: '[REDACTED]' });
        await NotificationService.sendDiscordNotification(
          {
            title: '\u{1F4E7} Email Rebotado',
            description: `El correo no pudo entregarse a **${email}**.`,
            fields: [
              {
                name: 'Acción',
                value: 'El usuario debe ser marcado para revisión.',
                inline: false,
              },
            ],
          },
          'ERRORS',
        );
        break;

      case 'email.complained':
        log.error('SPAM complaint — unsubscribing immediately', { email: '[REDACTED]' });
        await NotificationService.sendDiscordNotification(
          {
            title: '\u{1F6D1} Queja de SPAM',
            description: `**${email}** marcó un correo como spam.`,
            fields: [{ name: 'Acción', value: 'Desuscribir de inmediato.', inline: false }],
          },
          'ERRORS',
        );
        break;

      case 'email.delivered':
        log.info('Email delivered', { msgId });
        break;

      default:
        log.info('Resend webhook: unhandled event type', { type });
    }
  } catch (error) {
    const durationMs = Math.round(performance.now() - start);
    log.error('Resend webhook handler error', {
      type,
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });
    // Return 500 so Resend retries the delivery
    return NextResponse.json({ error: 'Handler failed', type }, { status: 500 });
  }

  const durationMs = Math.round(performance.now() - start);
  log.debug('Resend webhook processed', { type, durationMs });

  return NextResponse.json({ received: true });
}
