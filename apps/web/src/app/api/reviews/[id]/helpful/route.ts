import { db, reviews, reviewVotes } from '@pranakaia/infrastructure/db';
import { and, count, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CommonErrors } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { applyRateLimitHeaders, rateLimit } from '@/lib/security/rate-limit-redis';
import { requireAuth } from '@/lib/supabase/server';

const log = createLogger({ module: 'api:reviews:helpful' });

const paramsSchema = z.object({
  id: z.string().uuid('Review ID must be a valid UUID.'),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/reviews/[id]/helpful
export async function POST(request: NextRequest, props: RouteContext) {
  const start = performance.now();

  const rl = await rateLimit(request, 'reviews:helpful:POST', 60, 60);
  if (!rl.allowed) {
    const response = CommonErrors.TooManyRequests('Too many helpful votes. Please wait.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth();
  } catch {
    const response = CommonErrors.Unauthorized('You must be signed in to vote on reviews.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  const { id } = await props.params;
  const parsedParams = paramsSchema.safeParse({ id });
  if (!parsedParams.success) {
    const response = CommonErrors.BadRequest(
      parsedParams.error.issues.map((issue) => issue.message).join(', '),
    );
    applyRateLimitHeaders(response, rl);
    return response;
  }

  try {
    const [review] = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        status: reviews.status,
      })
      .from(reviews)
      .where(eq(reviews.id, parsedParams.data.id))
      .limit(1);

    if (!review || review.status !== 'approved') {
      const response = CommonErrors.NotFound('Review not found.');
      applyRateLimitHeaders(response, rl);
      return response;
    }

    if (review.userId === user.id) {
      const response = CommonErrors.Forbidden('You cannot vote on your own review.');
      applyRateLimitHeaders(response, rl);
      return response;
    }

    const result = await db.transaction(async (tx) => {
      await tx
        .insert(reviewVotes)
        .values({
          reviewId: parsedParams.data.id,
          userId: user.id,
          isHelpful: true,
        })
        .onConflictDoUpdate({
          target: [reviewVotes.reviewId, reviewVotes.userId],
          set: { isHelpful: true },
        });

      const [totals] = await tx
        .select({ total: count(reviewVotes.id) })
        .from(reviewVotes)
        .where(
          and(eq(reviewVotes.reviewId, parsedParams.data.id), eq(reviewVotes.isHelpful, true)),
        );

      const helpfulCount = Number(totals?.total ?? 0);

      await tx
        .update(reviews)
        .set({
          helpfulCount,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, parsedParams.data.id));

      return helpfulCount;
    });

    const durationMs = Math.round(performance.now() - start);
    log.info('Review helpful vote recorded', {
      reviewId: parsedParams.data.id,
      userId: user.id,
      helpfulCount: result,
      durationMs,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        reviewId: parsedParams.data.id,
        helpfulCount: result,
      },
    });
    applyRateLimitHeaders(response, rl);
    return response;
  } catch (error) {
    const durationMs = Math.round(performance.now() - start);
    log.error('Failed to record helpful vote', {
      reviewId: parsedParams.data.id,
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });

    const response = CommonErrors.InternalServerError(
      'Unable to record your vote at this time. Please try again later.',
    );
    applyRateLimitHeaders(response, rl);
    return response;
  }
}
