import { describe, expect, it } from 'vitest';
import { Money, VALID_CURRENCIES } from './money';

describe('Money', () => {
  // ── Factory: create() ─────────────────────────────────────────────────

  describe('create()', () => {
    it('should create Money from a number with default currency USD', () => {
      const result = Money.create(100, 'USD');
      expect(result.isSuccess).toBe(true);
      const m = result.getValue();
      expect(m.amount).toBe(100);
      expect(m.amountInCents).toBe(10000);
      expect(m.currency).toBe('USD');
    });

    it('should create Money with CLP currency', () => {
      const result = Money.create(29990, 'CLP');
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().currency).toBe('CLP');
    });

    it('should create Money with zero amount', () => {
      const result = Money.create(0, 'USD');
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amount).toBe(0);
    });

    it('should create Money from an object input', () => {
      const result = Money.create({ amount: 50, currency: 'EUR' });
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amount).toBe(50);
      expect(result.getValue().currency).toBe('EUR');
    });

    it('should fail for NaN amount', () => {
      const result = Money.create(NaN, 'USD');
      expect(result.isFailure).toBe(true);
      expect(result.errorValue.code).toBe('INVALID_AMOUNT');
    });

    it('should fail for negative amount', () => {
      const result = Money.create(-10, 'USD');
      expect(result.isFailure).toBe(true);
      expect(result.errorValue.code).toBe('NEGATIVE_AMOUNT');
    });

    it('should fail for unsupported currency', () => {
      const result = Money.create(100, 'JPY' as any);
      expect(result.isFailure).toBe(true);
      expect(result.errorValue.code).toBe('UNSUPPORTED_CURRENCY');
    });

    it('should default to USD when currency is omitted', () => {
      const result = Money.create(100);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().currency).toBe('USD');
    });

    it('should handle decimal amounts correctly (cents conversion)', () => {
      const result = Money.create(19.99, 'USD');
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amountInCents).toBe(1999);
    });

    it('should support all VALID_CURRENCIES', () => {
      for (const currency of VALID_CURRENCIES) {
        const result = Money.create(10, currency);
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().currency).toBe(currency);
      }
    });
  });

  // ── Factory: of() ─────────────────────────────────────────────────────

  describe('of()', () => {
    it('should return Result — same as create()', () => {
      const result = Money.of(100, 'CLP');
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amount).toBe(100);
    });

    it('should return failure for invalid input', () => {
      const result = Money.of(-5, 'USD');
      expect(result.isFailure).toBe(true);
    });
  });

  // ── Factory: fromCents() ──────────────────────────────────────────────

  describe('fromCents()', () => {
    it('should create Money from cents directly', () => {
      const result = Money.fromCents(19999, 'USD');
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amount).toBe(199.99);
      expect(result.getValue().amountInCents).toBe(19999);
    });

    it('should fail for non-integer cents', () => {
      const result = Money.fromCents(19.5, 'USD');
      expect(result.isFailure).toBe(true);
      expect(result.errorValue.code).toBe('INVALID_CENTS');
    });

    it('should fail for negative cents', () => {
      const result = Money.fromCents(-1, 'USD');
      expect(result.isFailure).toBe(true);
    });

    it('should create zero cents', () => {
      const result = Money.fromCents(0, 'USD');
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amount).toBe(0);
    });
  });

  // ── Factory: zero() ───────────────────────────────────────────────────

  describe('zero()', () => {
    it('should create zero-amount Money', () => {
      const m = Money.zero('CLP');
      expect(m.amount).toBe(0);
      expect(m.amountInCents).toBe(0);
      expect(m.currency).toBe('CLP');
    });
  });

  // ── Arithmetic ────────────────────────────────────────────────────────

  describe('add()', () => {
    it('should add two Money values of the same currency', () => {
      const a = Money.create(100, 'USD').getValue();
      const b = Money.create(50, 'USD').getValue();
      const result = a.add(b);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amount).toBe(150);
    });

    it('should fail on currency mismatch', () => {
      const a = Money.create(100, 'USD').getValue();
      const b = Money.create(50, 'CLP').getValue();
      const result = a.add(b);
      expect(result.isFailure).toBe(true);
      expect(result.errorValue.code).toBe('CURRENCY_MISMATCH');
    });
  });

  describe('subtract()', () => {
    it('should subtract two Money values of the same currency', () => {
      const a = Money.create(100, 'USD').getValue();
      const b = Money.create(30, 'USD').getValue();
      const result = a.subtract(b);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amount).toBe(70);
    });

    it('should fail on currency mismatch', () => {
      const a = Money.create(100, 'USD').getValue();
      const b = Money.create(30, 'EUR').getValue();
      const result = a.subtract(b);
      expect(result.isFailure).toBe(true);
    });

    it('should fail when result would be negative', () => {
      const a = Money.create(10, 'USD').getValue();
      const b = Money.create(50, 'USD').getValue();
      const result = a.subtract(b);
      expect(result.isFailure).toBe(true);
      expect(result.errorValue.code).toBe('NEGATIVE_RESULT');
    });
  });

  describe('multiply()', () => {
    it('should multiply by a positive factor', () => {
      const price = Money.create(19.99, 'USD').getValue();
      const result = price.multiply(3);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amount).toBe(59.97);
    });

    it('should multiply by zero', () => {
      const price = Money.create(100, 'USD').getValue();
      const result = price.multiply(0);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amount).toBe(0);
    });

    it('should fail for negative factor', () => {
      const price = Money.create(100, 'USD').getValue();
      const result = price.multiply(-1);
      expect(result.isFailure).toBe(true);
      expect(result.errorValue.code).toBe('NEGATIVE_FACTOR');
    });
  });

  describe('percentage()', () => {
    it('should calculate 19% IVA (Chile)', () => {
      const subtotal = Money.create(10000, 'CLP').getValue();
      const iva = subtotal.percentage(19);
      expect(iva.isSuccess).toBe(true);
      expect(iva.getValue().amount).toBe(1900);
    });

    it('should calculate 0%', () => {
      const price = Money.create(100, 'USD').getValue();
      const result = price.percentage(0);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amount).toBe(0);
    });

    it('should calculate 100%', () => {
      const price = Money.create(100, 'USD').getValue();
      const result = price.percentage(100);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amount).toBe(100);
    });

    it('should fail for percentage over 100', () => {
      const price = Money.create(100, 'USD').getValue();
      const result = price.percentage(101);
      expect(result.isFailure).toBe(true);
      expect(result.errorValue.code).toBe('INVALID_PERCENTAGE');
    });

    it('should fail for negative percentage', () => {
      const price = Money.create(100, 'USD').getValue();
      const result = price.percentage(-1);
      expect(result.isFailure).toBe(true);
    });
  });

  // ── Comparison ────────────────────────────────────────────────────────

  describe('isGreaterThan()', () => {
    it('should return true when greater', () => {
      const a = Money.create(100, 'USD').getValue();
      const b = Money.create(50, 'USD').getValue();
      expect(a.isGreaterThan(b)).toBe(true);
    });

    it('should return false on currency mismatch', () => {
      const a = Money.create(100, 'USD').getValue();
      const b = Money.create(50, 'EUR').getValue();
      expect(a.isGreaterThan(b)).toBe(false);
    });
  });

  describe('isLessThan()', () => {
    it('should return true when less', () => {
      const a = Money.create(50, 'USD').getValue();
      const b = Money.create(100, 'USD').getValue();
      expect(a.isLessThan(b)).toBe(true);
    });
  });

  describe('equals()', () => {
    it('should return true for equal Money', () => {
      const a = Money.create(100, 'USD').getValue();
      const b = Money.create(100, 'USD').getValue();
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const a = Money.create(100, 'USD').getValue();
      const b = Money.create(200, 'USD').getValue();
      expect(a.equals(b)).toBe(false);
    });

    it('should return false for different currencies', () => {
      const a = Money.create(100, 'USD').getValue();
      const b = Money.create(100, 'EUR').getValue();
      expect(a.equals(b)).toBe(false);
    });
  });

  // ── Formatting & Serialization ───────────────────────────────────────

  describe('format()', () => {
    it('should format in en-US locale by default', () => {
      const m = Money.create(1999.99, 'USD').getValue();
      const formatted = m.format('en-US');
      expect(formatted).toContain('1,999.99');
    });

    it('should format in es-CL locale', () => {
      const m = Money.create(29990, 'CLP').getValue();
      const formatted = m.format('es-CL');
      expect(formatted).toContain('29.990');
    });
  });

  describe('toPrimitives()', () => {
    it('should return { amount, currency }', () => {
      const m = Money.create(19.99, 'USD').getValue();
      expect(m.toPrimitives()).toEqual({ amount: 19.99, currency: 'USD' });
    });
  });

  // ── Immutability ──────────────────────────────────────────────────────

  describe('immutability', () => {
    it('should be frozen (immutable)', () => {
      const m = Money.create(100, 'USD').getValue();
      expect(Object.isFrozen(m)).toBe(true);
    });
  });
});
