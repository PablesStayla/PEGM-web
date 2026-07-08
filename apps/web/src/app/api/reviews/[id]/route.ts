import { db, reviews, reviewVotes, users } from '@pranakaia/infrastructure/db';
import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CommonErrors } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { applyRateLimitHeaders, rateLimit } from '@/lib/security/rate-limit-redis';
import { createClient, requireAuth } from '@/lib/supabase/server';

const log = createLogger({ module: 'api:reviews:id' });

const reviewParamsSchema = z.object({
  id: z.string().uuid('Review ID must be a valid UUID.'),
});

const patchReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.preprocess((value) => {
      if (value === null) {
        return null;
      }
      if (typeof value !== 'string') {
        return value;
      }
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    }, z.string().min(3).max(100).nullable().optional()),
    body: z.preprocess((value) => {
      if (value === null) {
        return null;
      }
      if (typeof value !== 'string') {
        return value;
      }
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    }, z.string().min(10).max(2000).nullable().optional()),
    status: z.enum(['pending', 'approved', 'rejected', 'hidden']).optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: 'At least one field must be provided.',
  });

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isAdminRole(role: unknown): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

// GET /api/reviews/[id]
export async function GET(_request: NextRequest, props: RouteContext) {
  const start = performance.now();

  const { id } = await props.params;
  const params = reviewParamsSchema.safeParse({ id });
  if (!params.success) {
    return CommonErrors.BadRequest(params.error.issues.map((issue) => issue.message).join(', '));
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [review] = await db
      .select({
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
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.id, params.data.id))
      .limit(1);

    if (!review) {
      return CommonErrors.NotFound('Review not found.');
    }

    const currentRole = user?.user_metadata?.['role'];
    const canSeeUnapproved =
      user !== null &&
      user !== undefined &&
      (user.id === review.userId || isAdminRole(currentRole));

    if (review.status !== 'approved' && !canSeeUnapproved) {
      // Avoid leaking moderation-state records to unauthorised users.
      return CommonErrors.NotFound('Review not found.');
    }

    const authorName = `${review.authorFirstName ?? ''} ${review.authorLastName ?? ''}`.trim();
    const durationMs = Math.round(performance.now() - start);
    log.info('Review fetched by ID', {
      reviewId: review.id,
      status: review.status,
      hasViewer: Boolean(user),
      durationMs,
    });

    return NextResponse.json({
      data: {
        id: review.id,
        productId: review.productId,
        userId: review.userId,
        rating: review.rating,
        title: review.title,
        body: review.body,
        status: review.status,
        helpfulCount: review.helpfulCount ?? 0,
        isVerifiedPurchase: review.isVerifiedPurchase ?? false,
        authorName: authorName || review.authorEmail,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
    });
  } catch (error) {
    const durationMs = Math.round(performance.now() - start);
    log.error('Failed to fetch review by ID', {
      reviewId: params.data.id,
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });
    return CommonErrors.InternalServerError('Unable to retrieve the review at this time.');
  }
}

// PATCH /api/reviews/[id]
export async function PATCH(request: NextRequest, props: RouteContext) {
  const start = performance.now();

  const rl = await rateLimit(request, 'reviews:id:PATCH', 30, 60);
  if (!rl.allowed) {
    const response = CommonErrors.TooManyRequests('Too many review update attempts. Please wait.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth();
  } catch {
    const response = CommonErrors.Unauthorized('You must be signed in to update a review.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  const { id } = await props.params;
  const params = reviewParamsSchema.safeParse({ id });
  if (!params.success) {
    const response = CommonErrors.BadRequest(
      params.error.issues.map((issue) => issue.message).join(', '),
    );
    applyRateLimitHeaders(response, rl);
    return response;
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    const response = CommonErrors.BadRequest('Request body must be valid JSON.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  const parsedBody = patchReviewSchema.safeParse(payload);
  if (!parsedBody.success) {
    const response = CommonErrors.UnprocessableEntity(
      `Validation failed: ${parsedBody.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`,
      { fields: parsedBody.error.flatten().fieldErrors },
    );
    applyRateLimitHeaders(response, rl);
    return response;
  }

  try {
    const [existing] = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        status: reviews.status,
      })
      .from(reviews)
      .where(eq(reviews.id, params.data.id))
      .limit(1);

    if (!existing) {
      const response = CommonErrors.NotFound('Review not found.');
      applyRateLimitHeaders(response, rl);
      return response;
    }

    const admin = isAdminRole(user.user_metadata?.['role']);
    const isOwner = existing.userId === user.id;

    if (!admin && !isOwner) {
      const response = CommonErrors.Forbidden('You cannot update this review.');
      applyRateLimitHeaders(response, rl);
      return response;
    }

    if (!admin && existing.status !== 'pending') {
      const response = CommonErrors.Forbidden('Only pending reviews can be edited by the author.');
      applyRateLimitHeaders(response, rl);
      return response;
    }

    if (!admin && parsedBody.data.status !== undefined) {
      const response = CommonErrors.Forbidden('Only admins can change moderation status.');
      applyRateLimitHeaders(response, rl);
      return response;
    }

    const updateData: Partial<typeof reviews.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (parsedBody.data.rating !== undefined) {
      updateData.rating = parsedBody.data.rating;
    }
    if (parsedBody.data.title !== undefined) {
      updateData.title = parsedBody.data.title;
    }
    if (parsedBody.data.body !== undefined) {
      updateData.content = parsedBody.data.body;
    }
    if (admin && parsedBody.data.status !== undefined) {
      updateData.status = parsedBody.data.status;
    }

    const [updated] = await db
      .update(reviews)
      .set(updateData)
      .where(eq(reviews.id, params.data.id))
      .returning({
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
      });

    const durationMs = Math.round(performance.now() - start);
    log.info('Review updated', {
      reviewId: params.data.id,
      actorId: user.id,
      actorIsAdmin: admin,
      durationMs,
    });

    const response = NextResponse.json({ success: true, data: updated });
    applyRateLimitHeaders(response, rl);
    return response;
  } catch (error) {
    const durationMs = Math.round(performance.now() - start);
    log.error('Failed to update review', {
      reviewId: params.data.id,
      actorId: user.id,
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });
    const response = CommonErrors.InternalServerError('Unable to update review at this time.');
    applyRateLimitHeaders(response, rl);
    return response;
  }
}

// DELETE /api/reviews/[id]
export async function DELETE(request: NextRequest, props: RouteContext) {
  const start = performance.now();

  const rl = await rateLimit(request, 'reviews:id:DELETE', 20, 60);
  if (!rl.allowed) {
    const response = CommonErrors.TooManyRequests('Too many review delete attempts. Please wait.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth();
  } catch {
    const response = CommonErrors.Unauthorized('You must be signed in to delete a review.');
    applyRateLimitHeaders(response, rl);
    return response;
  }

  const { id } = await props.params;
  const params = reviewParamsSchema.safeParse({ id });
  if (!params.success) {
    const response = CommonErrors.BadRequest(
      params.error.issues.map((issue) => issue.message).join(', '),
    );
    applyRateLimitHeaders(response, rl);
    return response;
  }

  try {
    const [existing] = await db
      .select({ id: reviews.id, userId: reviews.userId })
      .from(reviews)
      .where(eq(reviews.id, params.data.id))
      .limit(1);

    if (!existing) {
      const response = CommonErrors.NotFound('Review not found.');
      applyRateLimitHeaders(response, rl);
      return response;
    }

    const admin = isAdminRole(user.user_metadata?.['role']);
    const isOwner = existing.userId === user.id;
    if (!admin && !isOwner) {
      const response = CommonErrors.Forbidden('You cannot delete this review.');
      applyRateLimitHeaders(response, rl);
      return response;
    }

    await db.transaction(async (tx) => {
      await tx.delete(reviewVotes).where(eq(reviewVotes.reviewId, params.data.id));
      await tx.delete(reviews).where(eq(reviews.id, params.data.id));
    });

    const durationMs = Math.round(performance.now() - start);
    log.info('Review deleted', {
      reviewId: params.data.id,
      actorId: user.id,
      actorIsAdmin: admin,
      durationMs,
    });

    const response = NextResponse.json({
      success: true,
      data: { id: params.data.id },
    });
    applyRateLimitHeaders(response, rl);
    return response;
  } catch (error) {
    const durationMs = Math.round(performance.now() - start);
    log.error('Failed to delete review', {
      reviewId: params.data.id,
      actorId: user.id,
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });
    const response = CommonErrors.InternalServerError('Unable to delete review at this time.');
    applyRateLimitHeaders(response, rl);
    return response;
  }
}
