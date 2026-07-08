import type { NextRequest } from 'next/server';
import { redis } from '@/lib/redis/client';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

function getIP(req: Request | NextRequest): string {
  const headers = req.headers;
  const xfwd = headers instanceof Headers ? headers.get('x-forwarded-for') : null;
  if (xfwd) {
    const firstIp = xfwd.split(',')[0];
    if (firstIp) {
      return firstIp.trim();
    }
  }
  const realIp = headers instanceof Headers ? headers.get('x-real-ip') : null;
  return realIp ?? '127.0.0.1';
}

export async function rateLimit(
  req: Request | NextRequest,
  identifier: string,
  limit = 100,
  windowSec = 15 * 60,
): Promise<RateLimitResult> {
  const ip = getIP(req);
  const key = `ratelimit:${identifier}:${ip}`;

  // Atomic increment via Upstash REST API (Edge-compatible)
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSec);
  }

  const ttl = await redis.ttl(key);
  const remaining = Math.max(0, limit - count);
  const allowed = count <= limit;
  const reset = Date.now() + Math.max(ttl, 0) * 1000;

  return { allowed, remaining, reset, limit };
}

export function applyRateLimitHeaders(res: Response, rl: RateLimitResult): void {
  // IETF standard rate limit headers
  res.headers.set('RateLimit-Limit', String(rl.limit));
  res.headers.set('RateLimit-Remaining', String(rl.remaining));
  res.headers.set('RateLimit-Reset', Math.ceil((rl.reset - Date.now()) / 1000).toString());

  // Backward-compatible X- headers
  res.headers.set('X-RateLimit-Limit', String(rl.limit));
  res.headers.set('X-RateLimit-Remaining', String(rl.remaining));
  res.headers.set('X-RateLimit-Reset', new Date(rl.reset).toISOString());

  if (!rl.allowed) {
    const retryAfter = Math.ceil((rl.reset - Date.now()) / 1000);
    res.headers.set('Retry-After', String(Math.max(retryAfter, 0)));
  }
}
