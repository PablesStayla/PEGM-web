import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRateLimit = vi.fn();
const mockApplyRateLimitHeaders = vi.fn();

vi.mock('@pranakaia/db', () => ({
  and: vi.fn(),
  couponRedemptions: {},
  coupons: {},
  count: vi.fn(),
  db: {
    select: vi.fn(),
  },
  eq: vi.fn(),
}));

vi.mock('@/lib/security/rate-limit-redis', () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
  applyRateLimitHeaders: (...args: unknown[]) => mockApplyRateLimitHeaders(...args),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { POST } from './route';

describe('Coupons Validate API route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 100,
      reset: Date.now() + 60_000,
      limit: 60,
    });
  });

  it('returns 429 when rate limit is exceeded', async () => {
    mockRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      reset: Date.now() + 60_000,
      limit: 60,
    });

    const request = new NextRequest('http://localhost/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'WELCOME10',
        orderTotal: 10000,
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.title).toBe('Too Many Requests');
    expect(mockApplyRateLimitHeaders).toHaveBeenCalled();
  });

  it('returns 400 when payload is invalid', async () => {
    const request = new NextRequest('http://localhost/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'A',
        orderTotal: -1,
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.title).toBe('Bad Request');
    expect(mockApplyRateLimitHeaders).toHaveBeenCalled();
  });
});
