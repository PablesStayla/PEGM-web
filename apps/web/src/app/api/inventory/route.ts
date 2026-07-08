import { db, eq, inventory, lte, products, sql } from '@pranakaia/infrastructure/db';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CommonErrors } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { applyRateLimitHeaders, rateLimit } from '@/lib/security/rate-limit-redis';
import { requireAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = createLogger({ module: 'api:inventory' });

const listInventorySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  lowStockOnly: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

const upsertInventorySchema = z
  .object({
    productId: z.string().uuid('Invalid productId format.'),
    sku: z.string().trim().min(1, 'sku is required.').max(120),
    quantity: z.number().int().min(0),
    reservedQuantity: z.number().int().min(0).default(0),
    lowStockThreshold: z.number().int().min(0).optional(),
    reorderPoint: z.number().int().min(0).optional(),
  })
  .refine((value) => value.reservedQuantity <= value.quantity, {
    message: 'reservedQuantity cannot exceed quantity.',
    path: ['reservedQuantity'],
  });

export async function GET(request: NextRequest) {
  const start = performance.now();

  const rl = await rateLimit(request, 'inventory:GET', 60, 60);
  if (!rl.allowed) {
    const response = CommonErrors.TooManyRequests('Too many inventory requests. Please wait.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  let admin: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    admin = await requireAdmin();
  } catch {
    const response = CommonErrors.Unauthorized('Admin access required.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  const parsedQuery = listInventorySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );
  if (!parsedQuery.success) {
    const response = CommonErrors.BadRequest(
      parsedQuery.error.issues.map((issue) => issue.message).join(', '),
    );
    applyRateLimitHeaders(response, rl);
    return response;
  }

  const { page, limit, lowStockOnly } = parsedQuery.data;
  const offset = (page - 1) * limit;

  try {
    const rowsBase = db
      .select({
        id: inventory.id,
        productId: inventory.productId,
        sku: inventory.sku,
        quantity: inventory.quantity,
        reservedQuantity: inventory.reservedQuantity,
        lowStockThreshold: inventory.lowStockThreshold,
        reorderPoint: inventory.reorderPoint,
        updatedAt: inventory.updatedAt,
        productName: products.name,
        productSlug: products.slug,
        productStatus: products.status,
      })
      .from(inventory)
      .innerJoin(products, eq(products.id, inventory.productId));

    const rowsQuery = lowStockOnly
      ? rowsBase
          .where(lte(inventory.quantity, sql<number>`coalesce(${inventory.lowStockThreshold}, 10)`))
          .orderBy(inventory.quantity)
      : rowsBase.orderBy(inventory.updatedAt);

    const [rows, totalRows, lowStockRows] = await Promise.all([
      rowsQuery.limit(limit).offset(offset),
      lowStockOnly
        ? db
            .select({ count: sql<number>`count(*)` })
            .from(inventory)
            .where(
              lte(inventory.quantity, sql<number>`coalesce(${inventory.lowStockThreshold}, 10)`),
            )
        : db.select({ count: sql<number>`count(*)` }).from(inventory),
      db
        .select({ count: sql<number>`count(*)` })
        .from(inventory)
        .where(lte(inventory.quantity, sql<number>`coalesce(${inventory.lowStockThreshold}, 10)`)),
    ]);

    const total = Number(totalRows[0]?.count ?? 0);
    const lowStockCount = Number(lowStockRows[0]?.count ?? 0);

    const response = NextResponse.json({
      items: rows.map((row) => ({
        id: row.id,
        productId: row.productId,
        sku: row.sku,
        quantity: row.quantity,
        reservedQuantity: row.reservedQuantity,
        availableQuantity: row.quantity - row.reservedQuantity,
        lowStockThreshold: row.lowStockThreshold,
        reorderPoint: row.reorderPoint,
        updatedAt: row.updatedAt,
        product: {
          id: row.productId,
          name: row.productName,
          slug: row.productSlug,
          status: row.productStatus,
        },
      })),
      total,
      lowStockCount,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNextPage: offset + limit < total,
        hasPrevPage: page > 1,
      },
    });

    applyRateLimitHeaders(response, rl);
    log.info('Inventory retrieved', {
      adminId: admin?.id ?? 'unknown-admin',
      page,
      limit,
      lowStockOnly: lowStockOnly ?? false,
      total,
      lowStockCount,
      durationMs: Math.round(performance.now() - start),
    });
    return response;
  } catch (error) {
    log.error('Failed to retrieve inventory', {
      adminId: admin?.id ?? 'unknown-admin',
      error: error instanceof Error ? error.message : String(error),
      durationMs: Math.round(performance.now() - start),
    });
    const response = CommonErrors.InternalServerError('Unable to retrieve inventory at this time.');
    applyRateLimitHeaders(response, rl);
    return response;
  }
}

export async function POST(request: NextRequest) {
  const start = performance.now();

  const rl = await rateLimit(request, 'inventory:POST', 30, 60);
  if (!rl.allowed) {
    const response = CommonErrors.TooManyRequests('Too many inventory updates. Please wait.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  let admin: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    admin = await requireAdmin();
  } catch {
    const response = CommonErrors.Unauthorized('Admin access required.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const response = CommonErrors.BadRequest('Request body must be valid JSON.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  const parsedBody = upsertInventorySchema.safeParse(body);
  if (!parsedBody.success) {
    const response = CommonErrors.UnprocessableEntity(
      parsedBody.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; '),
      { fields: parsedBody.error.flatten().fieldErrors },
    );
    applyRateLimitHeaders(response, rl);
    return response;
  }

  const { productId, sku, quantity, reservedQuantity, lowStockThreshold, reorderPoint } =
    parsedBody.data;
  const normalizedSku = sku.trim();

  try {
    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      const response = CommonErrors.NotFound('Product not found.');
      applyRateLimitHeaders(response, rl);
      return response;
    }

    const [existingBySku] = await db
      .select({ id: inventory.id, productId: inventory.productId })
      .from(inventory)
      .where(eq(inventory.sku, normalizedSku))
      .limit(1);

    if (existingBySku && existingBySku.productId !== productId) {
      const response = CommonErrors.Conflict('SKU is already assigned to a different product.');
      applyRateLimitHeaders(response, rl);
      return response;
    }

    const updateSet = {
      productId,
      quantity,
      reservedQuantity,
      updatedAt: sql`now()`,
      ...(lowStockThreshold !== undefined ? { lowStockThreshold } : {}),
      ...(reorderPoint !== undefined ? { reorderPoint } : {}),
    };

    const [saved] = await db
      .insert(inventory)
      .values({
        productId,
        sku: normalizedSku,
        quantity,
        reservedQuantity,
        ...(lowStockThreshold !== undefined ? { lowStockThreshold } : {}),
        ...(reorderPoint !== undefined ? { reorderPoint } : {}),
      })
      .onConflictDoUpdate({
        target: inventory.sku,
        set: updateSet,
      })
      .returning({
        id: inventory.id,
        productId: inventory.productId,
        sku: inventory.sku,
        quantity: inventory.quantity,
        reservedQuantity: inventory.reservedQuantity,
        lowStockThreshold: inventory.lowStockThreshold,
        reorderPoint: inventory.reorderPoint,
        updatedAt: inventory.updatedAt,
      });

    if (!saved) {
      const response = CommonErrors.InternalServerError(
        'Failed to save the inventory item in the database.',
      );
      applyRateLimitHeaders(response, rl);
      return response;
    }

    const response = NextResponse.json(
      {
        success: true,
        data: {
          ...saved,
          availableQuantity: saved.quantity - saved.reservedQuantity,
        },
      },
      { status: existingBySku ? 200 : 201 },
    );

    applyRateLimitHeaders(response, rl);
    log.info('Inventory item upserted', {
      adminId: admin?.id ?? 'unknown-admin',
      inventoryId: saved.id,
      productId,
      sku: normalizedSku,
      quantity,
      reservedQuantity,
      created: !existingBySku,
      durationMs: Math.round(performance.now() - start),
    });
    return response;
  } catch (error) {
    log.error('Failed to upsert inventory item', {
      adminId: admin?.id ?? 'unknown-admin',
      productId,
      sku: normalizedSku,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Math.round(performance.now() - start),
    });
    const response = CommonErrors.InternalServerError('Unable to update inventory at this time.');
    applyRateLimitHeaders(response, rl);
    return response;
  }
}
