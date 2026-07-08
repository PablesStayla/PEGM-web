/**
 * @pranakaia/pricing — Public API
 *
 * Re-exports all types, errors, constants, and computation functions
 * for the pricing bounded context.
 */

export {
  applyDiscount,
  buildPriceBreakdown,
  calculateMargin,
  extractIvaFromPrice,
  extractTaxFromFinalPrice,
  IVA_RATE,
  MAX_DISCOUNT_RATE,
  MIN_MARKUP_VALUE,
} from './pricing.engine';
export type {
  Brand,
  DiscountResult,
  Markup,
  MoneyCLP,
  Percentage,
  PriceBreakdown,
} from './pricing.types';
export { PricingError, PricingValidationError } from './pricing.types';
