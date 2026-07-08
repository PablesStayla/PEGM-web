'use server';

import { db, orderItems, orders, productReviews } from '@pranakaia/infrastructure/db';
import { and, avg, count, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const ReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().max(2000).optional(),
  authorName: z.string().min(2).max(80),
});

export async function submitReview(data: z.infer<typeof ReviewSchema>) {
  try {
    ReviewSchema.parse(data);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if user purchased this product (verified purchase)
    let isVerifiedPurchase = false;
    if (user) {
      const purchase = await db
        .select({ id: orderItems.id })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(and(eq(orderItems.productId, data.productId), eq(orders.userId, user.id)));
      isVerifiedPurchase = purchase.length > 0;
    }

    await db.insert(productReviews).values({
      productId: data.productId,
      userId: user?.id ?? null,
      authorName: data.authorName,
      rating: data.rating,
      title: data.title ?? null,
      body: data.comment ?? null,
      isVerifiedPurchase,
      isApproved: false, // Requiere moderación
    });

    return {
      success: true,
      message: 'Reseña enviada. Será publicada tras revisión.',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Datos de reseña inválidos' };
    }
    return { success: false, error: 'Error al enviar la reseña' };
  }
}

export async function getProductReviews(productId: string) {
  try {
    const reviews = await db
      .select()
      .from(productReviews)
      .where(and(eq(productReviews.productId, productId), eq(productReviews.isApproved, true)))
      .orderBy(desc(productReviews.createdAt));

    const stats = await db
      .select({
        average: avg(productReviews.rating),
        total: count(productReviews.id),
      })
      .from(productReviews)
      .where(and(eq(productReviews.productId, productId), eq(productReviews.isApproved, true)));

    return {
      reviews,
      average: Number(stats[0]?.average ?? 0),
      total: Number(stats[0]?.total ?? 0),
    };
  } catch (_error) {
    return { reviews: [], average: 0, total: 0 };
  }
}

export async function markReviewHelpful(reviewId: string) {
  try {
    const review = await db
      .select({ helpfulCount: productReviews.helpfulCount })
      .from(productReviews)
      .where(eq(productReviews.id, reviewId));

    if (!review[0]) {
      return { success: false, error: 'Reseña no encontrada' };
    }

    await db
      .update(productReviews)
      .set({ helpfulCount: (review[0].helpfulCount ?? 0) + 1 })
      .where(eq(productReviews.id, reviewId));

    return { success: true };
  } catch (_error) {
    return { success: false, error: 'Error al marcar la reseña' };
  }
}
