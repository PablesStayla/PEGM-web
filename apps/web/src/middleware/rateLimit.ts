/**
 * @file apps/web/src/middleware/rateLimit.ts
 *
 * Rate limiting middleware for Next.js Edge/Node routes.
 * Uses Upstash Redis with a sliding window algorithm.
 *
 * Configuration:
 * - api:      100 req / 1 min   (general API reads)
 * - auth:       5 req / 15 min  (login/register - strict)
 * - checkout:  10 req / 1 min   (checkout - strict)
 * - webhook:  1000 req / 1 min  (Stripe/Flow webhooks - permissive)
 *
 * IP resolution order: x-forwarded-for -> x-real-ip -> 'anonymous'
 * Localhost / test environments bypass rate limiting when NODE_ENV != production.
 */

import { type Duration, Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis/cloudflare';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { createLogger } from '@/lib/logger';

const log = createLogger({ module: 'middleware:rateLimit' });

// Lazy-init Redis so unrelated tests don't need env vars set.
let _redis: Redis | null = null;

function getRedis(): Redis {
  if (_redis) {
    return _redis;
  }

  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set for rate limiting.',
    );
  }

  _redis = new Redis({ url, token });
  return _redis;
}

type RateLimitType = 'api' | 'auth' | 'checkout' | 'webhook';

const RATE_LIMIT_CONFIGS: Record<RateLimitType, { requests: number; window: Duration }> = {
  api: { requests: 100, window: '1m' },
  auth: { requests: 5, window: '15m' },
  checkout: { requests: 10, window: '1m' },
  webhook: { requests: 1_000, window: '1m' },
};

const limiterCache = new Map<RateLimitType, Ratelimit>();

function getLimiter(type: RateLimitType): Ratelimit {
  const cached = limiterCache.get(type);
  if (cached) {
    return cached;
  }

  const { requests, window } = RATE_LIMIT_CONFIGS[type];
  const limiter = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: `pranakaia:rl:${type}`,
  });

  limiterCache.set(type, limiter);
  return limiter;
}

function resolveIp(request: NextRequest): string {
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim());
    const lastIp = ips[ips.length - 1];
    if (lastIp) {
      return lastIp;
    }
  }

  return 'anonymous';
}

function isLocalRequest(ip: string, request: NextRequest): boolean {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'anonymous') {
    return true;
  }
  const hostname = request.nextUrl.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export async function rateLimit(
  request: NextRequest,
  type: RateLimitType = 'api',
): Promise<NextResponse | null> {
  const ip = resolveIp(request);

  if (isLocalRequest(ip, request) && env.NODE_ENV !== 'production') {
    return null;
  }

  const { success, limit, remaining, reset } = await getLimiter(type).limit(ip);

  if (success) {
    log.debug('Rate limit check passed', { ip, type, remaining });
    return null;
  }

  const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1_000));

  log.warn('Rate limit exceeded', { ip, type, limit, retryAfter });

  return NextResponse.json(
    {
      type: 'https://pranakaia.com/errors/rate-limited',
      title: 'Too Many Requests',
      status: 429,
      detail: 'Rate limit exceeded. Please slow down and try again later.',
      limit,
      remaining: 0,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Content-Type': 'application/problem+json',
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(reset),
        'Retry-After': String(retryAfter),
      },
    },
  );
}

export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: number,
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(reset));
  return response;
}

export function _resetLimiterCache(): void {
  limiterCache.clear();
  _redis = null;
}
