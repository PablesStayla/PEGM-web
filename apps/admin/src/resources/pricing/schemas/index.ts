/**
 * Pricing Schemas
 */

import { z } from 'zod';

export const updatePricingSchema = z.object({
  productId: z.string(),
  basePrice: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  vatRate: z.number().min(0).max(1).optional(),
  margin: z.number().min(0).optional(),
});

export const calculateMarginSchema = z.object({
  costPrice: z.number(),
  sellingPrice: z.number(),
});

export type UpdatePricingInput = z.infer<typeof updatePricingSchema>;
export type CalculateMarginInput = z.infer<typeof calculateMarginSchema>;
