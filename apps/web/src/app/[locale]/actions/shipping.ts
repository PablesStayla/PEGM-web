'use server';

import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getShippingService } from '@/infrastructure/shipping/shipping-service.factory';
import { rateLimit } from '@/lib/security/rate-limit-redis';

const ShippingQuoteSchema = z.object({
  region: z.string(),
  country: z.string().default('CL'),
  city: z.string(),
  subtotal: z.number(),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        price: z.number(),
        quantity: z.number(),
        weight: z.number().optional(),
      }),
    )
    .optional(),
});

export async function getShippingRates(input: z.infer<typeof ShippingQuoteSchema>) {
  try {
    // 0. Rate Limiting (Anti-Bot)
    const headersList = await headers();
    const requestLike = { headers: headersList } as unknown as NextRequest;
    const rl = await rateLimit(requestLike, 'shipping:quote', 10, 60); // 10 per minute

    if (!rl.allowed) {
      return {
        success: false,
        error: 'Demasiadas consultas de envío. Reintenta en un momento.',
        rates: [],
      };
    }

    const validated = ShippingQuoteSchema.parse(input);
    const service = getShippingService();

    // Call domain service
    const ratesResult = await service.calculateOptions({
      region: validated.region,
      country: validated.country,
      city: validated.city,
      subtotal: validated.subtotal,
      items: validated.items?.map((item, index) => ({
        ...item,
        productId: item.productId ?? `shipping-item-${index + 1}`,
      })),
    });

    if (ratesResult.isFailure) {
      return {
        success: false,
        error: ratesResult.errorValue.message || 'No se pudieron calcular las tarifas de envío.',
        rates: [],
      };
    }

    return { success: true, rates: ratesResult.getValue() };
  } catch (_error) {
    return {
      success: false,
      error: 'No se pudieron calcular las tarifas de envío.',
      rates: [],
    };
  }
}
