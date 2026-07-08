/**
 * @file apps/web/src/app/api/reviews/route.ts
 *
 * GET  /api/reviews?productId=xxx  — Fetch reviews for a product
 * POST /api/reviews                — Submit a review (requires auth)
 */

import { db, orderItems, orders, products, reviews, users } from '@pranakaia/infrastructure/db';
import { and, asc, count, desc, eq, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CommonErrors } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { applyRateLimitHeaders, rateLimit } from '@/lib/security/rate-limit-redis';
import { requireAuth } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = createLogger({ module: 'api:reviews' });

// ── Schemas ────────────────────────────────────────────────────────────────

const getReviewsSchema = z.object({
  productId: z.string().uuid('productId must be a valid UUID'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(['newest', 'highest', 'lowest', 'helpful']).default('newest'),
});

const optionalTitleSchema = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().min(3).max(100).optional());

const createReviewSchema = z.object({
  productId: z.string().uuid('productId must be a valid UUID'),
  rating: z.number().int().min(1).max(5),
  title: optionalTitleSchema,
  body: z.string().trim().min(10).max(2000),
});

// ── GET /api/reviews ──────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const start = performance.now();

  const rl = await rateLimit(request, 'reviews:GET', 120, 60);
  if (!rl.allowed) {
    const response = CommonErrors.TooManyRequests('Too many review requests. Please slow down.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  const rawParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = getReviewsSchema.safeParse(rawParams);

  if (!parsed.success) {
    const response = CommonErrors.BadRequest(
      `Invalid query parameters: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
    );
    applyRateLimitHeaders(response, rl);
    return response;
  }

  const { productId, page, limit, sort } = parsed.data;
  const offset = (page - 1) * limit;
  const approvedWhere = and(eq(reviews.productId, productId), eq(reviews.status, 'approved'));

  try {
    const [totalRow, averageRow, distributionRows] = await Promise.all([
      db
        .select({ total: count(reviews.id) })
        .from(reviews)
        .where(approvedWhere),
      db
        .select({ average: sql<number | null>`avg(${reviews.rating})` })
        .from(reviews)
        .where(approvedWhere),
      db
        .select({ rating: reviews.rating, total: count(reviews.id) })
        .from(reviews)
        .where(approvedWhere)
        .groupBy(reviews.rating),
    ]);

    const reviewSelection = {
      id: reviews.id,
      productId: reviews.productId,
      userId: reviews.userId,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.content,
      status: reviews.status,
      helpfulCount: reviews.helpfulCount,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      authorFirstName: users.firstName,
      authorLastName: users.lastName,
      authorEmail: users.email,
    };

    const items =
      sort === 'highest'
        ? await db
            .select(reviewSelection)
            .from(reviews)
            .innerJoin(users, eq(reviews.userId, users.id))
            .where(approvedWhere)
            .orderBy(desc(reviews.rating), desc(reviews.createdAt))
            .limit(limit)
            .offset(offset)
        : sort === 'lowest'
          ? await db
              .select(reviewSelection)
              .from(reviews)
              .innerJoin(users, eq(reviews.userId, users.id))
              .where(approvedWhere)
              .orderBy(asc(reviews.rating), desc(reviews.createdAt))
              .limit(limit)
              .offset(offset)
          : sort === 'helpful'
            ? await db
                .select(reviewSelection)
                .from(reviews)
                .innerJoin(users, eq(reviews.userId, users.id))
                .where(approvedWhere)
                .orderBy(desc(reviews.helpfulCount), desc(reviews.createdAt))
                .limit(limit)
                .offset(offset)
            : await db
                .select(reviewSelection)
                .from(reviews)
                .innerJoin(users, eq(reviews.userId, users.id))
                .where(approvedWhere)
                .orderBy(desc(reviews.createdAt))
                .limit(limit)
                .offset(offset);

    const total = Number(totalRow[0]?.total ?? 0);
    const averageRatingRaw = averageRow[0]?.average ?? null;
    const averageRating = averageRatingRaw === null ? null : Number(averageRatingRaw);

    const ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    for (const row of distributionRows) {
      if (row.rating >= 1 && row.rating <= 5) {
        ratingDistribution[row.rating as 1 | 2 | 3 | 4 | 5] = Number(row.total);
      }
    }

    const durationMs = Math.round(performance.now() - start);
    log.info('Reviews fetched', { productId, page, limit, total, sort, durationMs });

    const response = NextResponse.json({
      data: items.map((row) => {
        const authorName = `${row.authorFirstName ?? ''} ${row.authorLastName ?? ''}`.trim();
        return {
          id: row.id,
          productId: row.productId,
          userId: row.userId,
          rating: row.rating,
          title: row.title,
          body: row.body,
          status: row.status,
          helpfulCount: row.helpfulCount ?? 0,
          isVerifiedPurchase: row.isVerifiedPurchase ?? false,
          authorName: authorName || row.authorEmail,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: offset + limit < total,
        hasPrevPage: page > 1,
      },
      summary: {
        averageRating,
        totalReviews: total,
        ratingDistribution,
      },
    });
    applyRateLimitHeaders(response, rl);
    return response;
  } catch (error) {
    const durationMs = Math.round(performance.now() - start);
    log.error('Failed to fetch reviews', {
      productId,
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });
    const response = CommonErrors.InternalServerError(
      'Unable to retrieve reviews at this time. Please try again later.',
    );
    applyRateLimitHeaders(response, rl);
    return response;
  }
}

// ── POST /api/reviews ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const start = performance.now();

  const rl = await rateLimit(request, 'reviews:POST', 20, 60);
  if (!rl.allowed) {
    const response = CommonErrors.TooManyRequests('Too many review submissions. Please wait.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth();
  } catch {
    const response = CommonErrors.Unauthorized('You must be signed in to submit a review.');
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

  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    const response = CommonErrors.UnprocessableEntity(
      `Validation failed: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
      { fields: parsed.error.flatten().fieldErrors },
    );
    applyRateLimitHeaders(response, rl);
    return response;
  }

  const { productId, rating, title, body: content } = parsed.data;

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

    const verifiedPurchaseResult = await db
      .select({ id: orderItems.id })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.productId, productId),
          eq(orders.userId, user.id),
          eq(orders.paymentStatus, 'PAID'),
        ),
      )
      .limit(1);

    const createResult = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: reviews.id, status: reviews.status })
        .from(reviews)
        .where(and(eq(reviews.productId, productId), eq(reviews.userId, user.id)))
        .limit(1);

      if (existing) {
        return {
          kind: 'exists' as const,
          existing,
        };
      }

      const [created] = await tx
        .insert(reviews)
        .values({
          productId,
          userId: user.id,
          rating,
          title: title ?? null,
          content,
          isVerifiedPurchase: verifiedPurchaseResult.length > 0,
          status: 'pending',
        })
        .returning({
          id: reviews.id,
          productId: reviews.productId,
          userId: reviews.userId,
          rating: reviews.rating,
          title: reviews.title,
          body: reviews.content,
          status: reviews.status,
          isVerifiedPurchase: reviews.isVerifiedPurchase,
          createdAt: reviews.createdAt,
        });

      if (!created) {
        throw new Error('Failed to save review in the database.');
      }

      return {
        kind: 'created' as const,
        created,
      };
    });

    if (createResult.kind === 'exists') {
      const response = CommonErrors.Conflict(
        `You already submitted a review for this product (status: ${createResult.existing.status}).`,
      );
      applyRateLimitHeaders(response, rl);
      return response;
    }

    const durationMs = Math.round(performance.now() - start);
    log.info('Review submitted', {
      reviewId: createResult.created.id,
      productId,
      userId: user.id,
      rating,
      durationMs,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: createResult.created,
        meta: {
          moderationRequired: true,
        },
      },
      { status: 201 },
    );
    applyRateLimitHeaders(response, rl);
    return response;
  } catch (error) {
    const durationMs = Math.round(performance.now() - start);
    log.error('Failed to submit review', {
      productId,
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });

    const response = CommonErrors.InternalServerError(
      'Unable to submit review at this time. Please try again later.',
    );
    applyRateLimitHeaders(response, rl);
    return response;
  }
}
