'use server';

import { z } from 'zod';
import { adminActionClient } from '@/lib/safe-action';

const updateProductStockSchema = z.object({
  productId: z.string(),
  stockQuantity: z.number(),
});

export const updateProductStockAction = adminActionClient
  .schema(updateProductStockSchema)
  .action(async ({ ctx }) => {
    if (!ctx.user?.id) {
      throw new Error('Not authenticated');
    }
    return { success: true, data: { updated: true } };
  });
