'use server';

import { z } from 'zod';
import { adminActionClient } from '@/lib/safe-action';

const updateProductSchema = z.object({
  productId: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  basePrice: z.number().optional(),
  salePrice: z.number().optional(),
  stockQuantity: z.number().optional(),
  categoryId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'OUT_OF_STOCK']).optional(),
});

export const updateProductAction = adminActionClient
  .schema(updateProductSchema)
  .action(async ({ ctx }) => {
    if (!ctx.user?.id) {
      throw new Error('Not authenticated');
    }
    return { success: true, data: { updated: true } };
  });

// Legacy export for backwards compatibility
export const updateProduct = updateProductAction;
