import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis/cloudflare';
import { env } from '@/lib/env';

// =====================================================
// REDIS CLIENT - UPSTASH CONFIGURATION
// =====================================================

const redisUrl = env.UPSTASH_REDIS_REST_URL;
const redisToken = env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Redis client configurado para Upstash
 * Usa REST API para compatibilidad con Edge Runtime
 */
export const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : (new Proxy({} as Redis, {
        get: () => () => Promise.resolve(null),
      }) as Redis);

// ── Rate Limiters (lazy-initialized) ─────────────────────────────────────────

let _ratelimit: Ratelimit | null = null;
let _ratelimitStrict: Ratelimit | null = null;

/**
 * Rate Limiter configurado con Redis
 *
 * Default: 10 requests por 10 segundos (sliding window)
 * Analytics: habilitado para monitoreo
 */
export function getRatelimit(): Ratelimit {
  if (!_ratelimit) {
    _ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: 'ratelimit',
    });
  }
  return _ratelimit;
}

/**
 * Rate Limiter para API sensibles (checkout, payments)
 *
 * Más restrictivo: 3 requests por 60 segundos
 */
export function getRatelimitStrict(): Ratelimit {
  if (!_ratelimitStrict) {
    _ratelimitStrict = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(3, '60 s'),
      analytics: true,
      prefix: 'ratelimit:strict',
    });
  }
  return _ratelimitStrict;
}

/**
 * Cache helper functions
 */
export const cache = {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return value as T | null;
  },

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: string | number | boolean, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, value);
    } else {
      await redis.set(key, value);
    }
  },

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  },

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number> {
    return await redis.incr(key);
  },

  /**
   * Get multiple keys
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const values = await redis.mget(...keys);
    return values as (T | null)[];
  },

  /**
   * Set multiple keys
   */
  async mset(keyValues: Record<string, unknown>): Promise<void> {
    await redis.mset(keyValues);
  },
};

/**
 * Session helper functions
 */
export const session = {
  /**
   * Create new session
   */
  async create(
    sessionId: string,
    data: Record<string, unknown>,
    ttlSeconds = 86400,
  ): Promise<void> {
    await redis.setex(`session:${sessionId}`, ttlSeconds, JSON.stringify(data));
  },

  /**
   * Get session data
   */
  async get<T>(sessionId: string): Promise<T | null> {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data as string) : null;
  },

  /**
   * Update session
   */
  async update(
    sessionId: string,
    data: Record<string, unknown>,
    ttlSeconds = 86400,
  ): Promise<void> {
    await redis.setex(`session:${sessionId}`, ttlSeconds, JSON.stringify(data));
  },

  /**
   * Destroy session
   */
  async destroy(sessionId: string): Promise<void> {
    await redis.del(`session:${sessionId}`);
  },

  /**
   * Extend session TTL
   */
  async extend(sessionId: string, ttlSeconds = 86400): Promise<void> {
    await redis.expire(`session:${sessionId}`, ttlSeconds);
  },
};

/**
 * Idempotency key helper
 */
export const idempotency = {
  /**
   * Check if idempotency key exists
   */
  async check(key: string): Promise<string | null> {
    return await redis.get(`idempotency:${key}`);
  },

  /**
   * Store idempotency key with result
   */
  async store(key: string, result: Record<string, unknown>, ttlSeconds = 86400): Promise<void> {
    await redis.setex(`idempotency:${key}`, ttlSeconds, JSON.stringify(result));
  },
};
