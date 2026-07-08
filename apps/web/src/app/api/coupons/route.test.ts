import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRateLimit = vi.fn();
const mockApplyRateLimitHeaders = vi.fn();
const mockRequireAdmin = vi.fn();
const mockDbSelect = vi.fn();
const mockDbInsert = vi.fn();

vi.mock('@pranakaia/db', () => ({
  coupons: {
    id: 'id',
    code: 'code',
    name: 'name',
    description: 'description',
    type: 'type',
    value: 'value',
    minAmount: 'minAmount',
    maxDiscount: 'maxDiscount',
    usageLimit: 'usageLimit',
    usageCount: 'usageCount',
    perCustomerLimit: 'perCustomerLimit',
    startsAt: 'startsAt',
    expiresAt: 'expiresAt',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
  },
  db: {
    select: (...args: unknown[]) => mockDbSelect(...args),
    insert: (...args: unknown[]) => mockDbInsert(...args),
  },
  desc: vi.fn(),
  eq: vi.fn(),
  sql: vi.fn(() => 'count'),
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

describe('Coupons API route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 100,
      reset: Date.now() + 60_000,
      limit: 60,
    });
    mockRequireAdmin.mockResolvedValue({ id: 'admin-user-id' });
  });

  function mockSelectExisting(existingRows: unknown[]) {
    mockDbSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(existingRows),
        }),
      }),
    });
  }

  it('returns 400 when GET query params are invalid', async () => {
    const request = new NextRequest('http://localhost/api/coupons?page=0');

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

    const request = new NextRequest('http://localhost/api/coupons');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.title).toBe('Too Many Requests');
  });

  it('returns 401 when GET admin auth fails', async () => {
    mockRequireAdmin.mockRejectedValueOnce(new Error('Unauthorized'));

    const request = new NextRequest('http://localhost/api/coupons');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.title).toBe('Unauthorized');
    expect(mockApplyRateLimitHeaders).toHaveBeenCalled();
  });

  it('returns 200 on GET with rows and pagination', async () => {
    mockDbSelect
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue([
                {
                  id: 'c1',
                  code: 'WELCOME10',
                  name: 'Welcome',
                  description: null,
                  type: 'percentage',
                  value: '10',
                  minAmount: null,
                  maxDiscount: null,
                  usageLimit: null,
                  usageCount: 0,
                  perCustomerLimit: null,
                  startsAt: new Date('2026-04-04T00:00:00.000Z'),
                  expiresAt: null,
                  isActive: true,
                  createdAt: new Date('2026-04-04T00:00:00.000Z'),
                  updatedAt: new Date('2026-04-04T00:00:00.000Z'),
                },
              ]),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockResolvedValue([{ total: 1 }]),
      });

    const request = new NextRequest('http://localhost/api/coupons?page=1&limit=20');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.pagination.total).toBe(1);
  });

  it('returns 200 on GET with active filter and decimal normalization', async () => {
    mockDbSelect
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([
                  {
                    id: 'c-filtered',
                    code: 'ACTIVE10',
                    name: 'Active Coupon',
                    description: 'Only active',
                    type: 'percentage',
                    value: '10',
                    minAmount: '1000.00',
                    maxDiscount: '500.00',
                    usageLimit: 50,
                    usageCount: 10,
                    perCustomerLimit: 2,
                    startsAt: new Date('2026-04-04T00:00:00.000Z'),
                    expiresAt: new Date('2026-06-04T00:00:00.000Z'),
                    isActive: true,
                    createdAt: new Date('2026-04-04T00:00:00.000Z'),
                    updatedAt: new Date('2026-04-05T00:00:00.000Z'),
                  },
                ]),
              }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

    const request = new NextRequest('http://localhost/api/coupons?page=1&limit=20&active=true');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data[0].minAmount).toBe(1000);
    expect(body.data[0].maxDiscount).toBe(500);
    expect(body.pagination.total).toBe(0);
  });

  it('returns 500 on GET when DB listing fails', async () => {
    mockDbSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockRejectedValue(new Error('db read failure')),
          }),
        }),
      }),
    });

    const request = new NextRequest('http://localhost/api/coupons?page=1&limit=20');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.title).toBe('Internal Server Error');
    expect(mockApplyRateLimitHeaders).toHaveBeenCalled();
  });

  it('returns 500 on GET when DB throws non-Error values', async () => {
    mockDbSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockRejectedValue('db read failure'),
          }),
        }),
      }),
    });

    const request = new NextRequest('http://localhost/api/coupons?page=1&limit=20');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.title).toBe('Internal Server Error');
  });

  it('returns 429 on POST when rate limit is exceeded', async () => {
    mockRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      reset: Date.now() + 60_000,
      limit: 20,
    });

    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'WELCOME10',
        name: 'Welcome',
        type: 'percentage',
        value: 10,
        startsAt: new Date().toISOString(),
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.title).toBe('Too Many Requests');
  });

  it('returns 401 on POST when admin auth fails', async () => {
    mockRequireAdmin.mockRejectedValueOnce(new Error('Unauthorized'));

    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'WELCOME10',
        name: 'Welcome',
        type: 'percentage',
        value: 10,
        startsAt: new Date().toISOString(),
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.title).toBe('Unauthorized');
    expect(mockApplyRateLimitHeaders).toHaveBeenCalled();
  });

  it('returns 422 on POST when payload fails business validation', async () => {
    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'WELCOME10',
        name: 'Welcome',
        type: 'percentage',
        value: 150,
        startsAt: new Date().toISOString(),
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.title).toBe('Unprocessable Entity');
    expect(mockApplyRateLimitHeaders).toHaveBeenCalled();
  });

  it('returns 422 on POST for invalid fixed coupon value', async () => {
    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'FIXED0',
        name: 'Fixed Invalid',
        type: 'fixed',
        value: 0,
        startsAt: new Date().toISOString(),
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(422);
  });

  it('returns 422 on POST for invalid free_shipping value', async () => {
    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'SHIP1',
        name: 'Shipping Invalid',
        type: 'free_shipping',
        value: 1,
        startsAt: new Date().toISOString(),
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(422);
  });

  it('returns 422 on POST when maxDiscount is used for non-percentage', async () => {
    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'FIXMAX',
        name: 'Invalid Max',
        type: 'fixed',
        value: 1000,
        maxDiscount: 500,
        startsAt: new Date().toISOString(),
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(422);
  });

  it('returns 422 on POST when expiresAt is earlier than startsAt', async () => {
    const startsAt = new Date('2026-04-05T00:00:00.000Z');
    const expiresAt = new Date('2026-04-04T00:00:00.000Z');

    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'DATEBAD',
        name: 'Date Invalid',
        type: 'percentage',
        value: 10,
        startsAt: startsAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(422);
  });

  it('returns 400 on POST when body is not valid JSON', async () => {
    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid-json',
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.title).toBe('Bad Request');
  });

  it('returns 409 on POST when coupon code already exists', async () => {
    mockSelectExisting([{ id: 'existing-coupon' }]);

    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'WELCOME10',
        name: 'Welcome',
        type: 'percentage',
        value: 10,
        startsAt: new Date().toISOString(),
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.title).toBe('Conflict');
  });

  it('returns 201 on POST when coupon is created successfully', async () => {
    mockSelectExisting([]);

    mockDbInsert.mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: 'new-coupon',
            code: 'WELCOME10',
            name: 'Welcome',
            description: null,
            type: 'percentage',
            value: '10',
            minAmount: null,
            maxDiscount: null,
            usageLimit: null,
            usageCount: 0,
            perCustomerLimit: null,
            startsAt: new Date('2026-04-04T00:00:00.000Z'),
            expiresAt: null,
            isActive: true,
            createdAt: new Date('2026-04-04T00:00:00.000Z'),
            updatedAt: new Date('2026-04-04T00:00:00.000Z'),
          },
        ]),
      }),
    });

    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'WELCOME10',
        name: 'Welcome',
        type: 'percentage',
        value: 10,
        startsAt: new Date().toISOString(),
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.id).toBe('new-coupon');
    expect(body.data.active).toBe(true);
  });

  it('returns 201 on POST with all optional fields and maps numeric outputs', async () => {
    mockSelectExisting([]);

    const returningSpy = vi.fn().mockResolvedValue([
      {
        id: 'new-coupon-optional',
        code: 'WELCOMEPLUS',
        name: 'Welcome Plus',
        description: 'Premium welcome',
        type: 'percentage',
        value: '15.00',
        minAmount: '2500.00',
        maxDiscount: '1200.00',
        usageLimit: 100,
        usageCount: 0,
        perCustomerLimit: 2,
        startsAt: new Date('2026-04-04T00:00:00.000Z'),
        expiresAt: new Date('2026-05-04T00:00:00.000Z'),
        isActive: false,
        createdAt: new Date('2026-04-04T00:00:00.000Z'),
        updatedAt: new Date('2026-04-04T00:00:00.000Z'),
      },
    ]);
    const valuesSpy = vi.fn().mockReturnValue({ returning: returningSpy });

    mockDbInsert.mockReturnValueOnce({
      values: valuesSpy,
    });

    const startsAt = new Date('2026-04-04T00:00:00.000Z');
    const expiresAt = new Date('2026-05-04T00:00:00.000Z');
    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'welcomeplus',
        name: 'Welcome Plus',
        description: 'Premium welcome',
        type: 'percentage',
        value: 15,
        minAmount: 2500,
        maxDiscount: 1200,
        usageLimit: 100,
        perCustomerLimit: 2,
        startsAt: startsAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        active: false,
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(valuesSpy).toHaveBeenCalled();
    expect(valuesSpy.mock.calls[0]?.[0]).toMatchObject({
      code: 'WELCOMEPLUS',
      description: 'Premium welcome',
      minAmount: '2500.00',
      maxDiscount: '1200.00',
      usageLimit: 100,
      perCustomerLimit: 2,
      isActive: false,
      createdBy: 'admin-user-id',
      updatedBy: 'admin-user-id',
    });
    expect(body.data.minAmount).toBe(2500);
    expect(body.data.maxDiscount).toBe(1200);
    expect(body.data.active).toBe(false);
  });

  it('returns 409 on POST when DB raises unique constraint violation', async () => {
    mockSelectExisting([]);

    mockDbInsert.mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue({
          code: '23505',
          constraint: 'coupons_code_key',
        }),
      }),
    });

    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'WELCOME10',
        name: 'Welcome',
        type: 'percentage',
        value: 10,
        startsAt: new Date().toISOString(),
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.title).toBe('Conflict');
  });

  it('returns 409 on POST when DB error message indicates unique violation', async () => {
    mockSelectExisting([]);

    mockDbInsert.mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue({
          message: 'duplicate key value violates unique constraint coupons_code_key',
        }),
      }),
    });

    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'WELCOME10',
        name: 'Welcome',
        type: 'percentage',
        value: 10,
        startsAt: new Date().toISOString(),
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.title).toBe('Conflict');
  });

  it('returns 500 on POST when DB insert fails with non-unique error', async () => {
    mockSelectExisting([]);

    mockDbInsert.mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue('db is down'),
      }),
    });

    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'WELCOME10',
        name: 'Welcome',
        type: 'percentage',
        value: 10,
        startsAt: new Date().toISOString(),
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.title).toBe('Internal Server Error');
  });

  it('returns 500 on POST when DB insert fails with Error object', async () => {
    mockSelectExisting([]);

    mockDbInsert.mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue(new Error('insert failed')),
      }),
    });

    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'WELCOME10',
        name: 'Welcome',
        type: 'percentage',
        value: 10,
        startsAt: new Date().toISOString(),
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.title).toBe('Internal Server Error');
  });

  it('returns 500 on POST when DB error object has non-coupon constraint', async () => {
    mockSelectExisting([]);

    mockDbInsert.mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue({
          constraint: 'orders_pkey',
        }),
      }),
    });

    const request = new NextRequest('http://localhost/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'WELCOME10',
        name: 'Welcome',
        type: 'percentage',
        value: 10,
        startsAt: new Date().toISOString(),
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.title).toBe('Internal Server Error');
  });
});
