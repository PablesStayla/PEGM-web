import {
  and,
  db,
  desc,
  eq,
  isNull,
  productImages,
  products,
  productVariants,
  sql,
  wishlists,
} from '@pranakaia/infrastructure/db';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CommonErrors } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { applyRateLimitHeaders, rateLimit } from '@/lib/security/rate-limit-redis';
import { requireAuth } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = createLogger({ module: 'api:wishlist' });

const listWishlistSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const createWishlistItemSchema = z.object({
  productId: z.string().uuid('Invalid productId format.'),
  variantId: z.string().uuid('Invalid variantId format.').optional(),
});

const deleteWishlistItemSchema = z
  .object({
    itemId: z.string().uuid('Invalid itemId format.').optional(),
    productId: z.string().uuid('Invalid productId format.').optional(),
    variantId: z.string().uuid('Invalid variantId format.').optional(),
  })
  .refine((value) => value.itemId || value.productId, {
    message: 'You must provide itemId or productId to remove a wishlist item.',
  });

export async function GET(request: NextRequest) {
  const start = performance.now();

  const rl = await rateLimit(request, 'wishlist:GET', 120, 60);
  if (!rl.allowed) {
    const response = CommonErrors.TooManyRequests('Too many wishlist requests. Please slow down.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth();
  } catch {
    const response = CommonErrors.Unauthorized('You must be signed in to view wishlist items.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  const parsedQuery = listWishlistSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );
  if (!parsedQuery.success) {
    const response = CommonErrors.BadRequest(
      parsedQuery.error.issues.map((issue) => issue.message).join(', '),
    );
    applyRateLimitHeaders(response, rl);
    return response;
  }

  const { page, limit } = parsedQuery.data;
  const offset = (page - 1) * limit;

  try {
    const [rows, totalRows] = await Promise.all([
      db
        .select({
          id: wishlists.id,
          productId: wishlists.productId,
          variantId: wishlists.variantId,
          createdAt: wishlists.createdAt,
          productName: products.name,
          productSlug: products.slug,
          productStatus: products.status,
          basePrice: products.basePrice,
          salePrice: products.salePrice,
          imageUrl: productImages.url,
          imageAlt: productImages.altText,
        })
        .from(wishlists)
        .innerJoin(products, eq(products.id, wishlists.productId))
        .leftJoin(
          productImages,
          and(eq(productImages.productId, products.id), eq(productImages.isMain, true)),
        )
        .where(eq(wishlists.userId, user.id))
        .orderBy(desc(wishlists.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(wishlists)
        .where(eq(wishlists.userId, user.id)),
    ]);

    const total = Number(totalRows[0]?.count ?? 0);
    const response = NextResponse.json({
      items: rows.map((row) => ({
        id: row.id,
        productId: row.productId,
        variantId: row.variantId,
        createdAt: row.createdAt,
        product: {
          id: row.productId,
          name: row.productName,
          slug: row.productSlug,
          status: row.productStatus,
          basePrice: row.basePrice,
          salePrice: row.salePrice,
          imageUrl: row.imageUrl,
          imageAlt: row.imageAlt,
        },
      })),
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNextPage: offset + limit < total,
        hasPrevPage: page > 1,
      },
    });

    applyRateLimitHeaders(response, rl);
    log.info('Wishlist retrieved', {
      userId: user.id,
      page,
      limit,
      total,
      durationMs: Math.round(performance.now() - start),
    });
    return response;
  } catch (error) {
    log.error('Failed to retrieve wishlist', {
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Math.round(performance.now() - start),
    });
    const response = CommonErrors.InternalServerError(
      'Unable to retrieve wishlist items at this time.',
    );
    applyRateLimitHeaders(response, rl);
    return response;
  }
}

export async function POST(request: NextRequest) {
  const start = performance.now();

  const rl = await rateLimit(request, 'wishlist:POST', 60, 60);
  if (!rl.allowed) {
    const response = CommonErrors.TooManyRequests('Too many wishlist updates. Please wait.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth();
  } catch {
    const response = CommonErrors.Unauthorized('You must be signed in to add wishlist items.');
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

  const parsedBody = createWishlistItemSchema.safeParse(body);
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

  const { productId, variantId } = parsedBody.data;

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

    if (variantId) {
      const [variant] = await db
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(and(eq(productVariants.id, variantId), eq(productVariants.productId, productId)))
        .limit(1);

      if (!variant) {
        const response = CommonErrors.NotFound('Variant not found for this product.');
        applyRateLimitHeaders(response, rl);
        return response;
      }
    }

    const [existing] = await db
      .select({ id: wishlists.id })
      .from(wishlists)
      .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)))
      .limit(1);

    if (existing) {
      const response = CommonErrors.Conflict('Product is already in your wishlist.');
      applyRateLimitHeaders(response, rl);
      return response;
    }

    const [inserted] = await db
      .insert(wishlists)
      .values({
        userId: user.id,
        productId,
        ...(variantId ? { variantId } : {}),
      })
      .returning({
        id: wishlists.id,
        productId: wishlists.productId,
        variantId: wishlists.variantId,
        createdAt: wishlists.createdAt,
      });

    if (!inserted) {
      const response = CommonErrors.InternalServerError(
        'Failed to save wishlist item in the database.',
      );
      applyRateLimitHeaders(response, rl);
      return response;
    }

    const response = NextResponse.json(
      {
        data: inserted,
        message: 'Wishlist item added.',
      },
      { status: 201 },
    );

    applyRateLimitHeaders(response, rl);
    log.info('Wishlist item created', {
      userId: user.id,
      productId,
      variantId: variantId ?? null,
      wishlistId: inserted.id,
      durationMs: Math.round(performance.now() - start),
    });
    return response;
  } catch (error) {
    log.error('Failed to create wishlist item', {
      userId: user.id,
      productId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Math.round(performance.now() - start),
    });
    const response = CommonErrors.InternalServerError('Unable to add wishlist item at this time.');
    applyRateLimitHeaders(response, rl);
    return response;
  }
}

export async function DELETE(request: NextRequest) {
  const start = performance.now();

  const rl = await rateLimit(request, 'wishlist:DELETE', 60, 60);
  if (!rl.allowed) {
    const response = CommonErrors.TooManyRequests('Too many wishlist updates. Please wait.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth();
  } catch {
    const response = CommonErrors.Unauthorized('You must be signed in to remove wishlist items.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  const rawBody =
    request.headers.get('content-type')?.includes('application/json') === true
      ? await request.json().catch(() => undefined)
      : undefined;

  const parsedBody = deleteWishlistItemSchema.safeParse({
    itemId: request.nextUrl.searchParams.get('itemId') ?? (rawBody as { itemId?: string })?.itemId,
    productId:
      request.nextUrl.searchParams.get('productId') ??
      (rawBody as { productId?: string })?.productId,
    variantId:
      request.nextUrl.searchParams.get('variantId') ??
      (rawBody as { variantId?: string })?.variantId,
  });

  if (!parsedBody.success) {
    const response = CommonErrors.BadRequest(
      parsedBody.error.issues.map((issue) => issue.message).join(', '),
    );
    applyRateLimitHeaders(response, rl);
    return response;
  }

  const { itemId, productId, variantId } = parsedBody.data;

  try {
    const where = itemId
      ? and(eq(wishlists.id, itemId), eq(wishlists.userId, user.id))
      : and(
          eq(wishlists.userId, user.id),
          eq(wishlists.productId, productId!),
          variantId ? eq(wishlists.variantId, variantId) : isNull(wishlists.variantId),
        );

    const [deleted] = await db.delete(wishlists).where(where).returning({ id: wishlists.id });

    if (!deleted) {
      const response = CommonErrors.NotFound('Wishlist item not found.');
      applyRateLimitHeaders(response, rl);
      return response;
    }

    const response = NextResponse.json({
      success: true,
      removedId: deleted.id,
    });
    applyRateLimitHeaders(response, rl);

    log.info('Wishlist item removed', {
      userId: user.id,
      itemId: deleted.id,
      durationMs: Math.round(performance.now() - start),
    });

    return response;
  } catch (error) {
    log.error('Failed to remove wishlist item', {
      userId: user.id,
      itemId: itemId ?? null,
      productId: productId ?? null,
      variantId: variantId ?? null,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Math.round(performance.now() - start),
    });

    const response = CommonErrors.InternalServerError(
      'Unable to remove wishlist item at this time.',
    );
    applyRateLimitHeaders(response, rl);
    return response;
  }
}
