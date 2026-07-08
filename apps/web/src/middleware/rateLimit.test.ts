import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetEnvCache } from '@/lib/env';

/**
 * Unit tests for the rate-limit middleware.
 * Mocks @upstash/ratelimit and @upstash/redis to avoid network calls.
 */

// â”€â”€ Mocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const mockLimit = vi.fn();

vi.mock('@upstash/ratelimit', () => {
  return {
    Ratelimit: class MockRatelimit {
      limit = mockLimit;
      static slidingWindow = vi.fn().mockReturnValue('sliding-window-config');
    },
  };
});

vi.mock('@upstash/redis/cloudflare', () => {
  return {
    Redis: class MockRedis {},
  };
});

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

// â”€â”€ Request factory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function makeRequest(ip: string, pathname = '/api/checkout', hostname = 'example.com') {
  return {
    ip,
    nextUrl: { pathname, hostname } as never,
    headers: {
      get: (key: string) => {
        if (key === 'x-forwarded-for') {
          return ip;
        }
        if (key === 'x-real-ip') {
          return ip;
        }
        return null;
      },
    } as never,
    url: `https://${hostname}${pathname}`,
  };
}

// â”€â”€ Tests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('rateLimit middleware', () => {
  beforeEach(() => {
    // Set required env vars
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example.com');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test-token');
    vi.stubEnv('NODE_ENV', 'production'); // disable local bypass
    resetEnvCache();
  });

  afterEach(async () => {
    vi.clearAllMocks();
    // Reset the limiter cache between tests to pick up new mocks
    const mod = await import('./rateLimit');
    mod._resetLimiterCache();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  describe('when limit is NOT exceeded', () => {
    it('returns null (allow request)', async () => {
      mockLimit.mockResolvedValueOnce({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60_000,
      });

      const { rateLimit } = await import('./rateLimit');
      const req = makeRequest('203.0.113.10');
      const result = await rateLimit(req as never, 'api');

      expect(result).toBeNull();
    });

    it('calls the limiter with the correct IP', async () => {
      mockLimit.mockResolvedValueOnce({
        success: true,
        limit: 100,
        remaining: 50,
        reset: Date.now() + 60_000,
      });

      const { rateLimit } = await import('./rateLimit');
      await rateLimit(makeRequest('1.2.3.4') as never, 'checkout');

      expect(mockLimit).toHaveBeenCalledWith('1.2.3.4');
    });
  });

  describe('when limit IS exceeded', () => {
    it('returns a 429 response', async () => {
      mockLimit.mockResolvedValueOnce({
        success: false,
        limit: 5,
        remaining: 0,
        reset: Date.now() + 30_000,
      });

      const { rateLimit } = await import('./rateLimit');
      const result = await rateLimit(makeRequest('5.6.7.8') as never, 'auth');

      expect(result).not.toBeNull();
      expect(result?.status).toBe(429);
    });

    it('429 response has Retry-After header with a positive value', async () => {
      mockLimit.mockResolvedValueOnce({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60_000,
      });

      const { rateLimit } = await import('./rateLimit');
      const result = await rateLimit(makeRequest('5.6.7.8') as never, 'checkout');

      const retryAfter = Number(result?.headers.get('Retry-After'));
      expect(retryAfter).toBeGreaterThan(0);
    });

    it('429 response body is RFC 7807 problem+json', async () => {
      const resetTime = Date.now() + 45_000;
      mockLimit.mockResolvedValueOnce({
        success: false,
        limit: 5,
        remaining: 0,
        reset: resetTime,
      });

      const { rateLimit } = await import('./rateLimit');
      const result = await rateLimit(makeRequest('9.9.9.9') as never, 'auth');
      const body = await result?.json();

      expect(body).toMatchObject({
        status: 429,
        title: 'Too Many Requests',
        limit: 5,
        remaining: 0,
      });
      expect(typeof body.retryAfter).toBe('number');
    });

    it('X-RateLimit-Remaining header is "0"', async () => {
      mockLimit.mockResolvedValueOnce({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 20_000,
      });

      const { rateLimit } = await import('./rateLimit');
      const result = await rateLimit(makeRequest('2.2.2.2') as never, 'webhook');

      expect(result?.headers.get('X-RateLimit-Remaining')).toBe('0');
    });
  });

  describe('local/test bypass', () => {
    it('bypasses rate limiting for localhost requests in non-production', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      resetEnvCache();

      const { rateLimit } = await import('./rateLimit');
      const req = makeRequest('127.0.0.1', '/api/checkout', 'localhost');
      const result = await rateLimit(req as never, 'checkout');

      expect(result).toBeNull();
      expect(mockLimit).not.toHaveBeenCalled();
    });

    it('does NOT bypass for localhost in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      resetEnvCache();
      mockLimit.mockResolvedValueOnce({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60_000,
      });

      const { rateLimit } = await import('./rateLimit');
      const req = makeRequest('127.0.0.1', '/api/checkout', 'localhost');
      await rateLimit(req as never, 'checkout');

      // In production, even localhost gets rate-limited
      expect(mockLimit).toHaveBeenCalledOnce();
    });
  });

  describe('Retry-After edge cases', () => {
    it('retryAfter is never negative (reset in the past)', async () => {
      mockLimit.mockResolvedValueOnce({
        success: false,
        limit: 5,
        remaining: 0,
        reset: Date.now() - 1_000, // already reset
      });

      const { rateLimit } = await import('./rateLimit');
      const result = await rateLimit(makeRequest('3.3.3.3') as never, 'api');
      const body = await result?.json();

      expect(body.retryAfter).toBeGreaterThanOrEqual(0);
    });
  });
});
