import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * Edge Rate-Limiting (Staff Level)
 * Provee proteccion contra rafagas y abusos en rutas criticas.
 */

function createRedisClient(): Redis | null {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const redis = createRedisClient();

const ratelimit =
  redis === null
    ? null
    : new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '1 m'),
        analytics: true,
        prefix: 'pranakaia_edge_ratelimit',
      });

function getRequestSubject(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || '127.0.0.1';
  const userId = request.headers.get('x-user-id')?.trim();

  return userId ? `user:${userId}` : `ip:${ip}`;
}

export async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse | null> {
  if (!ratelimit) {
    if (env.NODE_ENV === 'production') {
      console.warn(
        '⚠️ [SECURITY] Rate limiting is not configured in production. Protection is disabled.',
      );
      return new NextResponse('Service Unavailable: rate limiting not configured', {
        status: 503,
      });
    } else {
      console.warn('Rate limiting is not configured. Protection is disabled.');
    }
    return null;
  }

  const { success, limit, reset, remaining } = await ratelimit.limit(getRequestSubject(request));

  if (!success) {
    return new NextResponse('Too Many Requests (Rate Limit Exceeded)', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    });
  }

  return null;
}
