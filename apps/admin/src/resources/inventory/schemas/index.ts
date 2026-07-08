/**
 * Inventory Schemas
 */

import { z } from 'zod';

export const getInventoryStatsSchema = z.object({}).optional();

export const getLowStockProductsSchema = z
  .object({
    limit: z.number().default(10),
  })
  .optional();

export const updateStockSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
  reason: z.string().optional(),
});

export const bulkUpdateStockSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(0),
    }),
  ),
  reason: z.string().optional(),
});

export type GetLowStockProductsInput = z.infer<typeof getLowStockProductsSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type BulkUpdateStockInput = z.infer<typeof bulkUpdateStockSchema>;
