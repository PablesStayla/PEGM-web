import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRateLimit = vi.fn();
const mockApplyRateLimitHeaders = vi.fn();
const mockRequireAdmin = vi.fn();

vi.mock('@pranakaia/db', () => ({
  and: vi.fn(),
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
  eq: vi.fn(),
  inventory: {},
  lte: vi.fn(),
  products: {},
  sql: vi.fn(),
}));

vi.mock('@/lib/security/rate-limit-redis', () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
  applyRateLimitHeaders: (...args: unknown[]) => mockApplyRateLimitHeaders(...args),
}));

vi.mock('@/lib/supabase/server', () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { GET, POST } from './route';

describe('Inventory API route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 100,
      reset: Date.now() + 60_000,
      limit: 60,
    });
    mockRequireAdmin.mockResolvedValue({ id: 'admin-user' });
  });

  it('returns 400 when GET query params are invalid', async () => {
    const request = new NextRequest('http://localhost/api/inventory?page=invalid');

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
      limit: 60,
    });

    const request = new NextRequest('http://localhost/api/inventory');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.title).toBe('Too Many Requests');
  });

  it('returns 401 on POST when admin auth fails', async () => {
    mockRequireAdmin.mockRejectedValueOnce(new Error('Unauthorized'));

    const request = new NextRequest('http://localhost/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: '11111111-1111-1111-1111-111111111111',
        sku: 'SKU-TEST-1',
        quantity: 10,
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.title).toBe('Unauthorized');
    expect(mockApplyRateLimitHeaders).toHaveBeenCalled();
  });

  it('returns 422 on POST when payload fails validation', async () => {
    const request = new NextRequest('http://localhost/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: '11111111-1111-1111-1111-111111111111',
        sku: 'SKU-TEST-2',
        quantity: 5,
        reservedQuantity: 8,
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.title).toBe('Unprocessable Entity');
    expect(mockApplyRateLimitHeaders).toHaveBeenCalled();
  });
});
