'use server';

import { products as productTable } from '@pranakaia/infrastructure/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { adminActionClient } from '@/lib/safe-action';

const toggleProductActiveSchema = z.object({
  productId: z.string(),
});

export const toggleProductActiveAction = adminActionClient
  .schema(toggleProductActiveSchema)
  .action(async ({ ctx }) => {
    if (!ctx.user?.id) {
      throw new Error('Not authenticated');
    }
    return { success: true, data: { isActive: true } };
  });

// Legacy export for backwards compatibility
export const toggleProductActive = adminActionClient
  .schema(toggleProductActiveSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.user?.id) {
      throw new Error('Not authenticated');
    }

    const { productId } = parsedInput;

    const product = await db
      .select()
      .from(productTable)
      .where(eq(productTable.id, productId))
      .limit(1);

    if (!product || product.length === 0) {
      logger.error('Product not found', { productId });
      throw new Error('Product not found');
    }

    return { success: true, data: { isActive: !product[0]?.isFeatured } };
  });
