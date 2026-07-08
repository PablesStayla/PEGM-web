import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockLimit = vi.hoisted(() => vi.fn());

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class MockRatelimit {
    limit = mockLimit;
    static slidingWindow = vi.fn().mockReturnValue('sliding-window-config');
  },
}));

vi.mock('@upstash/redis', () => ({
  Redis: class MockRedis {},
}));

function makeRequest(headers: Record<string, string> = {}) {
  return {
    headers: new Headers(headers),
  };
}

describe('rate-limit middleware (apps/web/src/middleware/rate-limit.ts)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns 503 in production when Upstash credentials are missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    Reflect.deleteProperty(process.env, 'UPSTASH_REDIS_REST_URL');
    Reflect.deleteProperty(process.env, 'UPSTASH_REDIS_REST_TOKEN');

    const { rateLimitMiddleware } = await import('./rate-limit');
    const result = await rateLimitMiddleware(makeRequest() as never);

    expect(result?.status).toBe(503);
    expect(mockLimit).not.toHaveBeenCalled();
  });

  it('allows request in development when Upstash is not configured', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    Reflect.deleteProperty(process.env, 'UPSTASH_REDIS_REST_URL');
    Reflect.deleteProperty(process.env, 'UPSTASH_REDIS_REST_TOKEN');

    const { rateLimitMiddleware } = await import('./rate-limit');
    const result = await rateLimitMiddleware(makeRequest() as never);

    expect(result).toBeNull();
    expect(mockLimit).not.toHaveBeenCalled();
  });

  it('uses x-user-id as rate-limit subject when present', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example.com');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'redis_test_auth');

    mockLimit.mockResolvedValueOnce({
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60_000,
    });

    const { rateLimitMiddleware } = await import('./rate-limit');
    const result = await rateLimitMiddleware(
      makeRequest({
        'x-user-id': 'user-123',
        'x-forwarded-for': '203.0.113.10',
      }) as never,
    );

    expect(result).toBeNull();
    expect(mockLimit).toHaveBeenCalledWith('user:user-123');
  });

  it('falls back to IP and returns 429 when limited', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example.com');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'redis_test_auth');

    mockLimit.mockResolvedValueOnce({
      success: false,
      limit: 60,
      remaining: 0,
      reset: Date.now() + 60_000,
    });

    const { rateLimitMiddleware } = await import('./rate-limit');
    const result = await rateLimitMiddleware(
      makeRequest({
        'x-forwarded-for': '198.51.100.1',
      }) as never,
    );

    expect(result?.status).toBe(429);
    expect(result?.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(mockLimit).toHaveBeenCalledWith('ip:198.51.100.1');
  });

  it('uses x-real-ip when x-forwarded-for is absent', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example.com');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'redis_test_auth');

    mockLimit.mockResolvedValueOnce({
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60_000,
    });

    const { rateLimitMiddleware } = await import('./rate-limit');
    await rateLimitMiddleware(
      makeRequest({
        'x-real-ip': '203.0.113.77',
      }) as never,
    );

    expect(mockLimit).toHaveBeenCalledWith('ip:203.0.113.77');
  });

  it('uses localhost fallback when no IP headers are present', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example.com');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'redis_test_auth');

    mockLimit.mockResolvedValueOnce({
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60_000,
    });

    const { rateLimitMiddleware } = await import('./rate-limit');
    await rateLimitMiddleware(makeRequest() as never);

    expect(mockLimit).toHaveBeenCalledWith('ip:127.0.0.1');
  });
});
