/**
 * @pranakaia/pricing — Core Computation Engine
 *
 * Pure domain functions for Chilean dropshipping price calculations.
 * All monetary values use integer CLP arithmetic to avoid floating-point drift.
 */

import { Result } from '@pranakaia/shared-kernel';
import { z } from 'zod';
import {
  type DiscountResult,
  type Markup,
  type MoneyCLP,
  type Percentage,
  type PriceBreakdown,
  PricingValidationError,
} from './pricing.types';

// ── Domain Constants ─────────────────────────────────────────────────────────

export const IVA_RATE = 0.19;
export const MIN_MARKUP_VALUE = 1.15;
export const MAX_DISCOUNT_RATE = 0.3;

// ── Validation Schemas (internal) ────────────────────────────────────────────

const MoneySchema = z.number().int().nonnegative();
const MarkupSchema = z.number().min(MIN_MARKUP_VALUE);
const PercentageSchema = z.number().min(0).max(100);

// ── Pure Domain Functions ────────────────────────────────────────────────────

/**
 * Calculates a complete price breakdown from a base cost and markup.
 * Uses integer math for CLP to ensure financial safety.
 *
 * @example
 * ```ts
 * const result = buildPriceBreakdown(1000, 1.2);
 * if (result.success) {
 *   console.log(result.value.finalPrice); // 1428 (1000 * 1.2 * 1.19)
 * }
 * ```
 *
 * @param costRaw - The supplier cost in CLP.
 * @param markupRaw - The markup multiplier (min 1.15).
 * @returns Result with PriceBreakdown or PricingError.
 */
export function buildPriceBreakdown(
  costRaw: number,
  markupRaw: number,
): Result<PriceBreakdown, PricingValidationError> {
  const costV = MoneySchema.safeParse(costRaw);
  const markupV = MarkupSchema.safeParse(markupRaw);

  if (!costV.success) {
    return Result.err(new PricingValidationError('Invalid cost amount', { raw: costRaw }));
  }
  if (!markupV.success) {
    return Result.err(
      new PricingValidationError(`Markup below minimum (${MIN_MARKUP_VALUE})`, { raw: markupRaw }),
    );
  }

  const cost = costV.data as MoneyCLP;
  const markup = markupV.data as Markup;

  const netPrice = Math.round(cost * markup) as MoneyCLP;
  const tax = Math.round(netPrice * IVA_RATE) as MoneyCLP;
  const finalPrice = (netPrice + tax) as MoneyCLP;

  const marginRaw = finalPrice > 0 ? ((finalPrice - cost) / finalPrice) * 100 : 0;
  const marginPercent = (Math.round(marginRaw * 100) / 100) as Percentage;

  return Result.ok({ cost, markup, netPrice, tax, finalPrice, marginPercent });
}

/**
 * Applies a percentage discount to a price, capped at {@link MAX_DISCOUNT_RATE}.
 *
 * @param priceRaw - Original price in CLP.
 * @param discountPercentRaw - Percentage to subtract (0–100).
 */
export function applyDiscount(
  priceRaw: number,
  discountPercentRaw: number,
): Result<DiscountResult, PricingValidationError> {
  const priceV = MoneySchema.safeParse(priceRaw);
  const percentV = PercentageSchema.safeParse(discountPercentRaw);

  if (!priceV.success) {
    return Result.err(new PricingValidationError('Invalid price', { raw: priceRaw }));
  }
  if (!percentV.success) {
    return Result.err(
      new PricingValidationError('Invalid percentage', { raw: discountPercentRaw }),
    );
  }

  const price = priceV.data as MoneyCLP;
  const cap = MAX_DISCOUNT_RATE * 100;
  const appliedPercent = Math.min(percentV.data, cap) as Percentage;

  const discountAmount = Math.round(price * (appliedPercent / 100)) as MoneyCLP;
  const finalPrice = (price - discountAmount) as MoneyCLP;

  return Result.ok({
    originalPrice: price,
    discountAmount,
    finalPrice,
    appliedDiscountPercent: appliedPercent,
  });
}

/**
 * Extracts the IVA amount from a price that already includes it (back-calculation).
 * Useful for tax reporting and invoice generation.
 *
 * @param priceWithIvaRaw - Total price paid by consumer.
 */
export function extractTaxFromFinalPrice(
  priceWithIvaRaw: number,
): Result<MoneyCLP, PricingValidationError> {
  const priceV = MoneySchema.safeParse(priceWithIvaRaw);
  if (!priceV.success) {
    return Result.err(new PricingValidationError('Invalid price', { raw: priceWithIvaRaw }));
  }

  const price = priceV.data as MoneyCLP;
  const tax = Math.round(price - price / (1 + IVA_RATE)) as MoneyCLP;

  return Result.ok(tax);
}

/** Alias for {@link extractTaxFromFinalPrice} using Chilean domain terminology. */
export const extractIvaFromPrice = extractTaxFromFinalPrice;

/**
 * Calculates the gross margin percentage from cost and selling price.
 *
 * @param params - `{ costPrice, sellingPrice }` in CLP.
 */
export function calculateMargin(params: {
  costPrice: number;
  sellingPrice: number;
}): Result<Percentage, PricingValidationError> {
  const costV = MoneySchema.safeParse(params.costPrice);
  const priceV = MoneySchema.safeParse(params.sellingPrice);

  if (!costV.success) {
    return Result.err(new PricingValidationError('Invalid cost price', { raw: params.costPrice }));
  }
  if (!priceV.success) {
    return Result.err(
      new PricingValidationError('Invalid selling price', { raw: params.sellingPrice }),
    );
  }

  const cost = costV.data;
  const price = priceV.data;

  if (price === 0) {
    return Result.ok(0 as Percentage);
  }

  const marginRaw = ((price - cost) / price) * 100;
  const marginPercent = (Math.round(marginRaw * 100) / 100) as Percentage;

  return Result.ok(marginPercent);
}
