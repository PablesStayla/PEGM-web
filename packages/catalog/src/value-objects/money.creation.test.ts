import { describe, expect, it } from 'vitest';
import { Money } from '../domain/value-objects/money.vo';

describe('Money - Creation & Validation', () => {
  it('should create valid money', () => {
    const result = Money.create(100, 'USD');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.amount).toBe(100);
      expect(result.value.currency).toBe('USD');
    }
  });

  it('should default to USD currency', () => {
    const result = Money.create(50);

    if (result.success) {
      expect(result.value.currency).toBe('USD');
    }
  });

  it('should reject negative amounts', () => {
    const result = Money.create(-10, 'USD');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('NEGATIVE_AMOUNT');
  });

  it('should reject invalid currencies', () => {
    const result = Money.create(100, 'INVALID' as any);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('UNSUPPORTED_CURRENCY');
  });

  it('should accept all valid currencies', () => {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'MXN', 'COP', 'CLP'];

    validCurrencies.forEach((currency) => {
      const result = Money.create(100, currency as any);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.currency).toBe(currency);
      }
    });
  });

  it('should accept zero amount', () => {
    const result = Money.create(0, 'USD');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.amount).toBe(0);
    }
  });

  it('should accept decimal amounts', () => {
    const result = Money.create(19.99, 'USD');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.amount).toBe(19.99);
    }
  });

  it('should handle very large amounts', () => {
    const result = Money.create(999999999.99, 'USD');
    expect(result.success).toBe(true);
  });

  it('should handle very small amounts', () => {
    const result = Money.create(0.01, 'USD');
    expect(result.success).toBe(true);
  });
});

describe('Money - Factory Methods', () => {
  describe('fromCents', () => {
    it('should convert cents to dollars', () => {
      const result = Money.fromCents(1999, 'USD');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.amount).toBe(19.99);
        expect(result.value.currency).toBe('USD');
      }
    });

    it('should handle whole dollars', () => {
      const result = Money.fromCents(100, 'USD');

      if (result.success) {
        expect(result.value.amount).toBe(1);
      }
    });
  });

  describe('zero', () => {
    it('should create zero amount', () => {
      const zero = Money.zero('USD');

      expect(zero.amount).toBe(0);
      expect(zero.currency).toBe('USD');
    });

    it('should default to USD', () => {
      const zero = Money.zero();

      expect(zero.currency).toBe('USD');
    });
  });
});
