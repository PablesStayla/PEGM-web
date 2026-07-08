'use server';

/**
 * Pricing Resource Actions — Thin Wrappers
 */

import { z } from 'zod';
import { actionClient } from '@/providers/action-provider';
import { container } from '@/providers/container';
import { unwrapAsync } from '@/providers/data/result-bridge';

const updatePriceSchema = z.object({
  productId: z.string(),
  basePrice: z.number().positive(),
  salePrice: z.number().positive().optional(),
});

const bulkDiscountSchema = z.object({
  productIds: z.array(z.string()),
  discountPercent: z.number().min(0).max(30),
});

export const updateProductPriceAction = actionClient
  .metadata({
    actionName: 'pricing.update_price',
    ability: { action: 'update', subject: 'Product' },
  })
  .schema(updatePriceSchema)
  .action(async ({ parsedInput, ctx }) => {
    return await unwrapAsync(
      container.pricingService.updateProductPrice({
        productId: parsedInput.productId,
        basePrice: parsedInput.basePrice,
        ...(parsedInput.salePrice !== undefined ? { salePrice: parsedInput.salePrice } : {}),
        adminId: ctx.sessionUser.id,
      }),
    );
  });

export const bulkApplyDiscountAction = actionClient
  .metadata({
    actionName: 'pricing.bulk_discount',
    ability: { action: 'update', subject: 'Product' },
  })
  .schema(bulkDiscountSchema)
  .action(async ({ parsedInput, ctx }) => {
    return await unwrapAsync(
      container.pricingService.bulkApplyDiscount({
        ...parsedInput,
        adminId: ctx.sessionUser.id,
      }),
    );
  });
