import { describe, expect, it } from 'vitest';
import { Money } from '../domain/value-objects/money.vo';

describe('Money - Formatting & Serialization', () => {
  describe('format', () => {
    it('should format as currency', () => {
      const money = Money.create(1234.56, 'USD').value;

      expect(money.format('en-US')).toBe('$1,234.56');
    });

    it('should format EUR', () => {
      const money = Money.create(1234.56, 'EUR').value;

      expect(money.format('en-US')).toMatch(/€/);
    });

    it('should format with different locale', () => {
      const money = Money.create(1234.56, 'USD').value;

      expect(money.format('es-CL')).not.toBe('$1,234.56');
    });
  });

  describe('toPrimitives', () => {
    it('should return plain object', () => {
      const money = Money.create(100, 'USD').value;
      const primitives = money.toPrimitives();

      expect(primitives).toEqual({
        amount: 100,
        currency: 'USD',
      });
    });

    it('should work with JSON.stringify', () => {
      const money = Money.create(100, 'USD').value;
      const json = JSON.stringify(money.toPrimitives());

      expect(json).toBe('{"amount":100,"currency":"USD"}');
    });
  });

  describe('immutability', () => {
    it('should freeze the instance', () => {
      const money = Money.create(100, 'USD').value;

      expect(Object.isFrozen(money)).toBe(true);
    });
  });
});

describe('Money - Edge Cases', () => {
  it('should handle all valid currencies', () => {
    const currencies = ['USD', 'EUR', 'GBP', 'MXN', 'COP', 'CLP'];

    currencies.forEach((currency) => {
      const result = Money.create(100, currency as any);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.currency).toBe(currency);
      }
    });
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
