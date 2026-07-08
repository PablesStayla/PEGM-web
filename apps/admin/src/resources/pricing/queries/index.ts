'use server';

/**
 * Pricing Queries for RSC
 */

import 'server-only';
import { calculateMargin } from '@pranakaia/pricing';
import { PricingService } from '../application/pricing.service';

export interface PricingData {
  productId: string;
  basePrice: number;
  salePrice: number | null;
  costPrice: number;
  margin: number;
  vatRate: number;
}

export async function getPricingDataQuery(): Promise<PricingData[]> {
  try {
    const result = await PricingService.getPricingData();

    if (!result.success) {
      throw result.errorValue;
    }

    return result.getValue();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch pricing data');
  }
}

export async function calculateMarginQuery(costPrice: number, sellingPrice: number) {
  try {
    const result = calculateMargin({ costPrice, sellingPrice });

    if (!result.success) {
      throw new Error(result.errorValue.message || 'Failed to calculate margin');
    }

    return result.getValue();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to calculate margin');
  }
}
