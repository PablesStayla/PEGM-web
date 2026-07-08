/**
 * Redis Rate Limiting Module
 * Basic implementation using Upstash Redis
 */

import { type Duration, Ratelimit } from '@upstash/ratelimit';
import { observabilityLogger } from '@/lib/logger';
import { redis } from './client';

interface RateLimitOptions {
  window: Duration;
  max: number;
}

const rateLimits = new Map<string, Ratelimit>();

/**
 * Create or get rate limiter for a key
 */
function getRateLimiter(key: string, options: RateLimitOptions): Ratelimit {
  const cacheKey = `${key}-${options.window}-${options.max}`;

  if (!rateLimits.has(cacheKey)) {
    rateLimits.set(
      cacheKey,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(options.max, options.window),
        analytics: true,
      }),
    );
  }

  return rateLimits.get(cacheKey)!;
}

/**
 * Rate limiting middleware
 */
export async function rateLimit(
  _request: Request,
  key: string,
  options: RateLimitOptions = { window: '1m', max: 100 },
): Promise<{ success: boolean; remaining?: number; reset?: Date }> {
  try {
    const identifier = key; // Could be IP, user ID, etc.

    const limiter = getRateLimiter(key, options);
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      remaining: result.remaining,
      reset: typeof result.reset === 'number' ? new Date(result.reset) : undefined,
    };
  } catch (error) {
    observabilityLogger.error('Rate limiting error', {
      error: error instanceof Error ? error.message : String(error),
    });
    // Allow request on error to avoid blocking users
    return { success: true };
  }
}

/**
 * Express-style middleware for Next.js API routes
 */
export async function rateLimitMiddleware(
  request: Request,
  key: string,
  options?: RateLimitOptions,
) {
  const result = await rateLimit(request, key, options);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter: result.reset ? Math.ceil((result.reset.getTime() - Date.now()) / 1000) : 60,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': result.reset
            ? Math.ceil((result.reset.getTime() - Date.now()) / 1000).toString()
            : '60',
        },
      },
    );
  }

  return null; // Continue with request
}
