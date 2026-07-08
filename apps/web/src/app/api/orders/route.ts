/**
 * @file apps/web/src/app/api/orders/route.ts
 *
 * GET /api/orders
 *
 * Returns the authenticated user’s orders with pagination and optional
 * filtering by status and date range.
 *
 * Security:
 * - Requires a valid Supabase session (401 on failure).
 * - Rate limited to 60 req / min per IP.
 * - All query params validated with Zod.
 */

import {
  and,
  count,
  db,
  desc,
  eq,
  gte,
  inArray,
  lte,
  orderItems,
  orders,
} from '@pranakaia/infrastructure/db';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CommonErrors } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { getRatelimit } from '@/lib/redis/client';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = createLogger({ module: 'api:orders' });

// ── Validation schema ──────────────────────────────────────────────────────

const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'FULFILLING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'FAILED',
] as const;

const listOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(ORDER_STATUSES).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

// ── GET /api/orders ──────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const start = performance.now();
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  // ── Rate limiting (fail-open to not block legitimate users on Redis outages) ──
  try {
    const { success } = await getRatelimit().limit(`orders_list:${ip}`);
    if (!success) {
      log.warn('Rate limit exceeded on orders list', { ip });
      return CommonErrors.TooManyRequests(
        'Too many requests. Please wait before fetching orders again.',
      );
    }
  } catch (rlError) {
    // Redis unavailable — log and continue (fail-open)
    log.warn('Rate limiter unavailable, proceeding without limit', {
      error: rlError instanceof Error ? rlError.message : String(rlError),
    });
  }

  // ── Authentication ──────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    log.warn('Unauthenticated orders request', { ip });
    return CommonErrors.Unauthorized('You must be signed in to view orders.');
  }

  // ── Query parameter validation ────────────────────────────────────────────
  const rawParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = listOrdersSchema.safeParse(rawParams);

  if (!parsed.success) {
    log.warn('Invalid orders query params', {
      userId: user.id,
      errors: parsed.error.flatten(),
    });
    return CommonErrors.BadRequest(
      `Invalid query parameters: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
    );
  }

  const { page, limit, status, from, to } = parsed.data;
  const offset = (page - 1) * limit;

  // ── Database query ───────────────────────────────────────────────────────────
  try {
    const whereConditions = [eq(orders.userId, user.id)];
    if (status) {
      whereConditions.push(eq(orders.status, status));
    }
    if (from) {
      whereConditions.push(gte(orders.createdAt, new Date(from)));
    }
    if (to) {
      whereConditions.push(lte(orders.createdAt, new Date(to)));
    }

    const [countResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(and(...whereConditions));
    const total = Number(countResult?.count ?? 0);

    const userOrders = await db
      .select()
      .from(orders)
      .where(and(...whereConditions))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    let orderItemsData: any[] = [];
    if (userOrders.length > 0) {
      orderItemsData = await db
        .select()
        .from(orderItems)
        .where(
          inArray(
            orderItems.orderId,
            userOrders.map((o) => o.id),
          ),
        );
    }

    const itemsByOrderId = orderItemsData.reduce(
      (acc, item) => {
        if (!acc[item.orderId]) {
          acc[item.orderId] = [];
        }
        acc[item.orderId].push({
          id: item.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: item.subtotal,
        });
        return acc;
      },
      {} as Record<string, any[]>,
    );

    const data = userOrders.map((order) => ({
      id: order.id,
      status: order.status,
      payment_status: order.paymentStatus,
      total: order.total,
      currency: order.currency,
      created_at: order.createdAt.toISOString(),
      updated_at: order.updatedAt.toISOString(),
      provider_order_id: order.providerOrderId,
      order_items: itemsByOrderId[order.id] || [],
    }));

    const durationMs = Math.round(performance.now() - start);

    log.info('Orders fetched', {
      userId: user.id,
      page,
      limit,
      total,
      durationMs,
    });

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: offset + limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    const durationMs = Math.round(performance.now() - start);
    log.error('Failed to fetch orders', {
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });
    return CommonErrors.InternalServerError(
      'Unable to retrieve orders at this time. Please try again.',
    );
  }
}
