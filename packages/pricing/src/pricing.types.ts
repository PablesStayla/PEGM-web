/**
 * @pranakaia/pricing — Domain Types and Errors
 *
 * Branded types, value shapes, and domain error classes for the pricing engine.
 */

import { DomainError } from '@pranakaia/shared-kernel';

// ── Branded Nominal Types ────────────────────────────────────────────────────

export type Brand<K, T extends string> = K & { readonly __brand: T };

/** Chilean Peso amount. Always a non-negative integer. */
export type MoneyCLP = Brand<number, 'MoneyCLP'>;

/** Price multiplier factor (e.g., 1.15 for 15% gross markup). */
export type Markup = Brand<number, 'Markup'>;

/** Percentage value (0–100). */
export type Percentage = Brand<number, 'Percentage'>;

// ── Domain Errors ────────────────────────────────────────────────────────────

/** Base class for all pricing-related domain errors. */
export class PricingError extends DomainError {
  constructor(message: string, code: string, context?: Record<string, unknown>) {
    super(message, `PRICING_${code}`, context);
    this.name = 'PricingError';
  }
}

/** Thrown when input validation fails during price computation. */
export class PricingValidationError extends PricingError {
  constructor(details: string, context?: Record<string, unknown>) {
    super(`Validation failed: ${details}`, 'VALIDATION_FAILED', context);
    this.name = 'PricingValidationError';
  }
}

// ── Value Object Shapes ──────────────────────────────────────────────────────

/**
 * Full pricing breakdown including cost, taxes, and margins.
 */
export interface PriceBreakdown {
  /** Supplier cost in CLP */
  readonly cost: MoneyCLP;
  /** Applied markup factor */
  readonly markup: Markup;
  /** Price before tax (Net) */
  readonly netPrice: MoneyCLP;
  /** Calculated IVA (19%) */
  readonly tax: MoneyCLP;
  /** Consumer price (PVP) */
  readonly finalPrice: MoneyCLP;
  /** Gross margin percentage on PVP */
  readonly marginPercent: Percentage;
}

/**
 * Result of a discount application.
 */
export interface DiscountResult {
  readonly originalPrice: MoneyCLP;
  readonly discountAmount: MoneyCLP;
  readonly finalPrice: MoneyCLP;
  readonly appliedDiscountPercent: Percentage;
}
