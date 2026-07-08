import { describe, expect, it } from 'vitest';
import {
  applyDiscount,
  buildPriceBreakdown,
  extractTaxFromFinalPrice,
  IVA_RATE,
  MAX_DISCOUNT_RATE,
  PricingValidationError,
} from './index';

describe('Pricing Engine - buildPriceBreakdown', () => {
  it('provides a correct breakdown for a typical product', () => {
    // Cost: $5000 CLP, Markup: 1.8
    // Net: 5000 * 1.8 = 9000
    // Tax: 9000 * 0.19 = 1710
    // Total: 10710
    const result = buildPriceBreakdown(5000, 1.8);

    expect(result.success).toBe(true);
    if (result.success) {
      const b = result.getValue();
      expect(b.cost).toBe(5000);
      expect(b.markup).toBe(1.8);
      expect(b.netPrice).toBe(9000);
      expect(b.tax).toBe(1710);
      expect(b.finalPrice).toBe(10710);
      // Margin: ((10710 - 5000) / 10710) * 100 = 53.31...
      expect(b.marginPercent).toBeCloseTo(53.31, 1);
    }
  });

  it('enforces whole CLP (integer) values', () => {
    // 999 * 1.2 * 1.19 = 1426.572 -> 1427
    const result = buildPriceBreakdown(999, 1.2);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Number.isInteger(result.getValue().finalPrice)).toBe(true);
      expect(result.getValue().finalPrice).toBe(1427);
    }
  });

  it('returns ValidationError for negative cost', () => {
    const result = buildPriceBreakdown(-100, 1.5);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorValue).toBeInstanceOf(PricingValidationError);
      expect((result.errorValue as PricingValidationError).code).toBe('PRICING_VALIDATION_FAILED');
    }
  });

  it('returns ValidationError for decimal cost', () => {
    const result = buildPriceBreakdown(100.5, 1.5);
    expect(result.success).toBe(false);
  });

  it('returns ValidationError for markup below MIN_MARKUP_VALUE', () => {
    const result = buildPriceBreakdown(1000, 1.1);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect((result.errorValue as Error).message).toContain('Markup below minimum');
    }
  });
});

describe('Pricing Engine - applyDiscount', () => {
  it('applies a valid discount', () => {
    const result = applyDiscount(10000, 10);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue().finalPrice).toBe(9000);
      expect(result.getValue().discountAmount).toBe(1000);
      expect(result.getValue().appliedDiscountPercent).toBe(10);
    }
  });

  it('caps discount at MAX_DISCOUNT_RATE', () => {
    const result = applyDiscount(10000, 50); // 50%
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue().appliedDiscountPercent).toBe(MAX_DISCOUNT_RATE * 100);
      expect(result.getValue().finalPrice).toBe(7000);
    }
  });

  it('fails for invalid price input', () => {
    const result = applyDiscount(-1, 10);
    expect(result.success).toBe(false);
  });
});

describe('Pricing Engine - extractTaxFromFinalPrice', () => {
  it('extracts IVA correctly (back-calculation)', () => {
    // 1190 total = 1000 net + 190 tax
    const result = extractTaxFromFinalPrice(1190);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(190);
    }
  });

  it('handles edge cases with rounding', () => {
    // 100 total -> Net = 100 / 1.19 = 84.03... -> Tax = 100 - 84 = 16
    const result = extractTaxFromFinalPrice(100);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(16);
    }
  });
});

describe('Pricing Constants', () => {
  it('has correct IVA_RATE', () => {
    expect(IVA_RATE).toBe(0.19);
  });
});
