import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRateLimit = vi.fn();
const mockApplyRateLimitHeaders = vi.fn();
const mockRequireAuth = vi.fn();

vi.mock('@pranakaia/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
  },
  and: vi.fn(),
  desc: vi.fn(),
  eq: vi.fn(),
  isNull: vi.fn(),
  productImages: {},
  products: {},
  productVariants: {},
  sql: vi.fn(),
  wishlists: {},
}));

vi.mock('@/lib/security/rate-limit-redis', () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
  applyRateLimitHeaders: (...args: unknown[]) => mockApplyRateLimitHeaders(...args),
}));

vi.mock('@/lib/supabase/server', () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { DELETE, GET, POST } from './route';

describe('Wishlist API route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 100,
      reset: Date.now() + 60_000,
      limit: 120,
    });
    mockRequireAuth.mockResolvedValue({ id: '11111111-1111-1111-1111-111111111111' });
  });

  it('returns 400 when GET query params are invalid', async () => {
    const request = new NextRequest('http://localhost/api/wishlist?page=abc');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.title).toBe('Bad Request');
    expect(mockApplyRateLimitHeaders).toHaveBeenCalledOnce();
  });

  it('returns 429 when GET rate limit is exceeded', async () => {
    mockRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      reset: Date.now() + 60_000,
      limit: 120,
    });

    const request = new NextRequest('http://localhost/api/wishlist');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.title).toBe('Too Many Requests');
  });

  it('returns 401 on POST when user is not authenticated', async () => {
    mockRequireAuth.mockRejectedValueOnce(new Error('Unauthorized'));

    const request = new NextRequest('http://localhost/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: '11111111-1111-1111-1111-111111111111',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.title).toBe('Unauthorized');
    expect(mockApplyRateLimitHeaders).toHaveBeenCalled();
  });

  it('returns 400 on DELETE when selector is missing', async () => {
    const request = new NextRequest('http://localhost/api/wishlist', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.title).toBe('Bad Request');
    expect(mockApplyRateLimitHeaders).toHaveBeenCalled();
  });
});
