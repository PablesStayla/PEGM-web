/**
 * @file apps/web/src/app/api/coupons/route.ts
 *
 * GET  /api/coupons  — List coupons (admin only)
 * POST /api/coupons  — Create coupon (admin only)
 */

import { coupons, db, desc, eq, sql } from '@pranakaia/infrastructure/db';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CommonErrors } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { applyRateLimitHeaders, rateLimit } from '@/lib/security/rate-limit-redis';
import { requireAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = createLogger({ module: 'api:coupons' });

// ── Schemas ────────────────────────────────────────────────────────────────

const createCouponSchema = z.object({
  /** 3-50 chars, auto-uppercased */
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(50)
    .transform((v) => v.toUpperCase().trim()),
  name: z.string().min(3),
  description: z.string().max(500).optional(),
  type: z.enum(['percentage', 'fixed', 'free_shipping']),
  /** For percentage: 0-100. For fixed: amount in CLP. */
  value: z.number().nonnegative(),
  /** Minimum order amount in CLP to apply the coupon */
  minAmount: z.number().int().nonnegative().optional(),
  /** Maximum discount in CLP (only relevant for percentage type) */
  maxDiscount: z.number().int().nonnegative().optional(),
  /** Total redemption limit across all customers */
  usageLimit: z.number().int().positive().optional(),
  /** Per-customer redemption limit */
  perCustomerLimit: z.number().int().positive().max(10).optional(),
  startsAt: z.string().datetime({ offset: true }),
  expiresAt: z.string().datetime({ offset: true }).optional(),
  active: z.boolean().default(true),
});

const validatedCreateCouponSchema = createCouponSchema.superRefine((value, ctx) => {
  if (value.type === 'percentage' && (value.value <= 0 || value.value > 100)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'For percentage coupons, value must be between 0 and 100.',
      path: ['value'],
    });
  }

  if (value.type === 'fixed' && value.value <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'For fixed coupons, value must be greater than 0.',
      path: ['value'],
    });
  }

  if (value.type === 'free_shipping' && value.value !== 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'For free_shipping coupons, value must be 0.',
      path: ['value'],
    });
  }

  if (value.maxDiscount !== undefined && value.type !== 'percentage') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'maxDiscount can only be used with percentage coupons.',
      path: ['maxDiscount'],
    });
  }

  if (
    value.expiresAt &&
    new Date(value.expiresAt).getTime() <= new Date(value.startsAt).getTime()
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'expiresAt must be later than startsAt.',
      path: ['expiresAt'],
    });
  }
});

const listCouponsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  active: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

const couponSelectFields = {
  id: coupons.id,
  code: coupons.code,
  name: coupons.name,
  description: coupons.description,
  type: coupons.type,
  value: coupons.value,
  minAmount: coupons.minAmount,
  maxDiscount: coupons.maxDiscount,
  usageLimit: coupons.usageLimit,
  usageCount: coupons.usageCount,
  perCustomerLimit: coupons.perCustomerLimit,
  startsAt: coupons.startsAt,
  expiresAt: coupons.expiresAt,
  isActive: coupons.isActive,
  createdAt: coupons.createdAt,
  updatedAt: coupons.updatedAt,
};

function toDbDecimal(value: number): string {
  return value.toFixed(2);
}

function isUniqueConstraintViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeDbError = error as {
    code?: string;
    constraint?: string;
    message?: string;
  };

  if (maybeDbError.code === '23505') {
    return true;
  }

  const constraint = String(maybeDbError.constraint ?? '').toLowerCase();
  const message = String(maybeDbError.message ?? '').toLowerCase();

  return constraint.includes('coupon') || message.includes('coupons_code_key');
}

// ── GET /api/coupons ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const start = performance.now();

  const rl = await rateLimit(request, 'coupons:GET', 60, 60);
  if (!rl.allowed) {
    const res = CommonErrors.TooManyRequests();
    applyRateLimitHeaders(res, rl);
    return res;
  }

  try {
    await requireAdmin();
  } catch {
    const res = CommonErrors.Unauthorized('Admin access required.');
    applyRateLimitHeaders(res, rl);
    return res;
  }

  const rawParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = listCouponsSchema.safeParse(rawParams);
  if (!parsed.success) {
    const res = CommonErrors.BadRequest(
      `Invalid query parameters: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
    );
    applyRateLimitHeaders(res, rl);
    return res;
  }

  const { page, limit, active } = parsed.data;
  const offset = (page - 1) * limit;

  try {
    const rowsQuery =
      active === undefined
        ? db.select(couponSelectFields).from(coupons)
        : db.select(couponSelectFields).from(coupons).where(eq(coupons.isActive, active));

    const rows = await rowsQuery.orderBy(desc(coupons.createdAt)).limit(limit).offset(offset);

    const countRows =
      active === undefined
        ? await db.select({ total: sql<number>`count(*)` }).from(coupons)
        : await db
            .select({ total: sql<number>`count(*)` })
            .from(coupons)
            .where(eq(coupons.isActive, active));

    const total = Number(countRows[0]?.total ?? 0);

    const res = NextResponse.json({
      data: rows.map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        description: row.description,
        type: row.type,
        value: Number(row.value),
        minAmount: row.minAmount === null ? null : Number(row.minAmount),
        maxDiscount: row.maxDiscount === null ? null : Number(row.maxDiscount),
        usageLimit: row.usageLimit,
        usageCount: row.usageCount,
        perCustomerLimit: row.perCustomerLimit,
        startsAt: row.startsAt,
        expiresAt: row.expiresAt,
        active: row.isActive,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: offset + limit < total,
        hasPrevPage: page > 1,
      },
    });
    applyRateLimitHeaders(res, rl);

    const durationMs = Math.round(performance.now() - start);
    log.info('Coupons list retrieved', {
      page,
      limit,
      active: active ?? null,
      total,
      durationMs,
    });

    return res;
  } catch (error) {
    log.error('Failed to list coupons', {
      error: error instanceof Error ? error.message : String(error),
      durationMs: Math.round(performance.now() - start),
    });
    const res = CommonErrors.InternalServerError('Unable to retrieve coupons at this time.');
    applyRateLimitHeaders(res, rl);
    return res;
  }
}

// ── POST /api/coupons ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const start = performance.now();

  const rl = await rateLimit(request, 'coupons:POST', 20, 60);
  if (!rl.allowed) {
    const res = CommonErrors.TooManyRequests();
    applyRateLimitHeaders(res, rl);
    return res;
  }

  let adminId: string;
  try {
    const admin = await requireAdmin();
    adminId = admin.id;
  } catch {
    const res = CommonErrors.Unauthorized('Admin access required.');
    applyRateLimitHeaders(res, rl);
    return res;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const res = CommonErrors.BadRequest('Request body must be valid JSON.');
    applyRateLimitHeaders(res, rl);
    return res;
  }

  const parsed = validatedCreateCouponSchema.safeParse(body);
  if (!parsed.success) {
    const res = CommonErrors.UnprocessableEntity(
      `Validation failed: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
      { fields: parsed.error.flatten().fieldErrors },
    );
    applyRateLimitHeaders(res, rl);
    return res;
  }

  try {
    const [existing] = await db
      .select({ id: coupons.id })
      .from(coupons)
      .where(eq(coupons.code, parsed.data.code))
      .limit(1);

    if (existing) {
      const res = CommonErrors.Conflict('Coupon code already exists.');
      applyRateLimitHeaders(res, rl);
      return res;
    }

    const [created] = await db
      .insert(coupons)
      .values({
        code: parsed.data.code,
        name: parsed.data.name,
        ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
        type: parsed.data.type,
        value: toDbDecimal(parsed.data.value),
        ...(parsed.data.minAmount !== undefined
          ? { minAmount: toDbDecimal(parsed.data.minAmount) }
          : {}),
        ...(parsed.data.maxDiscount !== undefined
          ? { maxDiscount: toDbDecimal(parsed.data.maxDiscount) }
          : {}),
        ...(parsed.data.usageLimit !== undefined ? { usageLimit: parsed.data.usageLimit } : {}),
        ...(parsed.data.perCustomerLimit !== undefined
          ? { perCustomerLimit: parsed.data.perCustomerLimit }
          : {}),
        startsAt: new Date(parsed.data.startsAt),
        ...(parsed.data.expiresAt !== undefined
          ? { expiresAt: new Date(parsed.data.expiresAt) }
          : {}),
        isActive: parsed.data.active,
        createdBy: adminId,
        updatedBy: adminId,
      })
      .returning({
        id: coupons.id,
        code: coupons.code,
        name: coupons.name,
        description: coupons.description,
        type: coupons.type,
        value: coupons.value,
        minAmount: coupons.minAmount,
        maxDiscount: coupons.maxDiscount,
        usageLimit: coupons.usageLimit,
        usageCount: coupons.usageCount,
        perCustomerLimit: coupons.perCustomerLimit,
        startsAt: coupons.startsAt,
        expiresAt: coupons.expiresAt,
        isActive: coupons.isActive,
        createdAt: coupons.createdAt,
        updatedAt: coupons.updatedAt,
      });

    if (!created) {
      const res = CommonErrors.InternalServerError('Failed to save the coupon in the database.');
      applyRateLimitHeaders(res, rl);
      return res;
    }

    const res = NextResponse.json(
      {
        data: {
          id: created.id,
          code: created.code,
          name: created.name,
          description: created.description,
          type: created.type,
          value: Number(created.value),
          minAmount: created.minAmount === null ? null : Number(created.minAmount),
          maxDiscount: created.maxDiscount === null ? null : Number(created.maxDiscount),
          usageLimit: created.usageLimit,
          usageCount: created.usageCount,
          perCustomerLimit: created.perCustomerLimit,
          startsAt: created.startsAt,
          expiresAt: created.expiresAt,
          active: created.isActive,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
      },
      { status: 201 },
    );
    applyRateLimitHeaders(res, rl);

    log.info('Coupon created', {
      couponId: created.id,
      code: created.code,
      type: created.type,
      adminId,
      durationMs: Math.round(performance.now() - start),
    });
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (isUniqueConstraintViolation(error)) {
      const res = CommonErrors.Conflict('Coupon code already exists.');
      applyRateLimitHeaders(res, rl);
      return res;
    }

    log.error('Failed to create coupon', {
      code: parsed.data.code,
      error: message,
      durationMs: Math.round(performance.now() - start),
    });

    const res = CommonErrors.InternalServerError('Unable to create coupon at this time.');
    applyRateLimitHeaders(res, rl);
    return res;
  }
}
