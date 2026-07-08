/**
 * Shipping Configuration — Single Source of Truth
 *
 * All shipping-related constants must reference this file.
 * DO NOT hardcode shipping values anywhere else in the codebase.
 */

/** Free shipping threshold in CLP */
export const FREE_SHIPPING_THRESHOLD = 80_000;

/** Standard shipping cost in CLP */
const STANDARD_SHIPPING_COST = 5_000;

/** IVA rate for Chile (19%) */
const IVA_RATE = 0.19;

/** Calculate shipping cost based on subtotal */
export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
}

/** Calculate IVA (Chilean tax included in prices) */
export function calculateIVA(subtotal: number): number {
  // In Chile, B2C prices include IVA. This extracts the IVA component.
  return Math.round(subtotal - subtotal / (1 + IVA_RATE));
}

/** Formatted threshold for display */
export const FREE_SHIPPING_THRESHOLD_FORMATTED = `$${FREE_SHIPPING_THRESHOLD.toLocaleString('es-CL')}`;

/** Shipping progress percentage */
export function shippingProgress(subtotal: number): number {
  return Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
}
