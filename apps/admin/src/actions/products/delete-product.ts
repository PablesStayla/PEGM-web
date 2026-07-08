'use server';

import { z } from 'zod';
import { adminActionClient } from '@/lib/safe-action';

const deleteProductSchema = z.object({
  productId: z.string(),
});

export const deleteProductAction = adminActionClient
  .schema(deleteProductSchema)
  .action(async ({ ctx }) => {
    if (!ctx.user?.id) {
      throw new Error('Not authenticated');
    }
    return { success: true, data: { deleted: true } };
  });

// Legacy export for backwards compatibility
export const deleteProduct = deleteProductAction;
