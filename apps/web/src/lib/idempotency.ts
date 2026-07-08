/**
 * @file apps/web/src/lib/idempotency.ts
 *
 * Idempotency key handler using Upstash Redis.
 * Implements the draft IETF Idempotency-Key header spec.
 *
 * @see https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header
 *
 * States: PROCESSING → FINISHED (or deleted on error for retry)
 */

import { headers } from 'next/headers';
import { createLogger } from './logger';
import { redis } from './redis/client';

const log = createLogger({ module: 'idempotency' });

/** 24 hours — long enough to safely absorb any retry window */
const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;

type IdempotencyState = { state: 'PROCESSING' } | { state: 'FINISHED'; response: unknown };

/**
 * Wrap a server action / API handler with idempotency semantics.
 *
 * - If no Idempotency-Key header is present: handler runs normally.
 * - If key is new: acquires a lock, runs handler, persists result.
 * - If key maps to FINISHED: returns cached response immediately.
 * - If key maps to PROCESSING (another worker is handling it): throws a 409.
 *
 * @example
 * export async function POST(request: Request) {
 *   return handleIdempotentRequest(async () => {
 *     // ... business logic
 *     return NextResponse.json({ ok: true });
 *   });
 * }
 */
export async function handleIdempotentRequest<T>(handler: () => Promise<T>): Promise<T> {
  const headersList = await headers();
  const idempotencyKey = headersList.get('idempotency-key');

  if (!idempotencyKey) {
    return handler();
  }

  log.debug('Idempotency check', { key: idempotencyKey });

  const redisKey = `idem:${idempotencyKey}`;

  // Try to acquire an atomic lock (SET NX).
  // Returns 'OK' if inserted, null if key already exists.
  const acquired = await redis.set(
    redisKey,
    JSON.stringify({ state: 'PROCESSING' } satisfies IdempotencyState),
    { nx: true, ex: IDEMPOTENCY_TTL_SECONDS },
  );

  if (!acquired) {
    // Key exists — check its state
    const cached = await redis.get<IdempotencyState>(redisKey);

    if (cached?.state === 'FINISHED') {
      log.debug('Idempotency cache hit', { key: idempotencyKey });
      return (cached as { state: 'FINISHED'; response: T }).response;
    }

    // Still PROCESSING in another worker — return 409 so the caller retries
    log.warn('Idempotent request still processing (concurrent duplicate)', {
      key: idempotencyKey,
    });
    throw new Error(
      'IDEMPOTENCY_CONFLICT: A request with this Idempotency-Key is already being processed.',
    );
  }

  // Lock acquired — run the handler
  try {
    const response = await handler();

    await redis.set(
      redisKey,
      JSON.stringify({ state: 'FINISHED', response } satisfies IdempotencyState),
      { ex: IDEMPOTENCY_TTL_SECONDS },
    );

    log.debug('Idempotency key finalised', { key: idempotencyKey });
    return response;
  } catch (error) {
    // Release the lock so future retries can proceed
    await redis.del(redisKey);
    log.error('Idempotent handler failed — lock released for retry', {
      key: idempotencyKey,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Generate a client-side idempotency key.
 * Uses crypto.randomUUID() for cryptographic randomness.
 *
 * @example
 * const key = generateIdempotencyKey();
 * // → 'idem_01926a34-b2c1-7f3e-9d12-5e4f8c0a1b2d'
 */
export function generateIdempotencyKey(): string {
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `idem_${uuid}`;
}
