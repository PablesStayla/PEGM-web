import { describe, expect, it } from 'vitest';
import { ValueObject } from './value-object';

class MoneyVO extends ValueObject<{ amount: number; currency: string }> {
  constructor(amount: number, currency: string = 'USD') {
    super({ amount, currency });
  }

  get amount(): number {
    return this._value.amount;
  }

  get currency(): string {
    return this._value.currency;
  }
}

class NameVO extends ValueObject<string> {}

describe('ValueObject - Serialization', () => {
  describe('toString', () => {
    it('should return string representation of value', () => {
      const vo = new NameVO('John');

      expect(vo.toString()).toBe('John');
    });

    it('should stringify object values', () => {
      const vo = new MoneyVO(100, 'USD');

      expect(vo.toString()).toBe('[object Object]');
    });
  });

  describe('toJSON', () => {
    it('should return the underlying value', () => {
      const vo = new NameVO('John');

      expect(vo.toJSON()).toBe('John');
    });

    it('should return object for complex values', () => {
      const vo = new MoneyVO(100, 'USD');

      expect(vo.toJSON()).toEqual({ amount: 100, currency: 'USD' });
    });

    it('should work with JSON.stringify', () => {
      const vo = new MoneyVO(100, 'USD');
      const json = JSON.stringify(vo);

      expect(json).toBe('{"amount":100,"currency":"USD"}');
    });
  });
});

describe('ValueObject - Immutability', () => {
  describe('immutability', () => {
    it('should not allow modification after creation', () => {
      const vo = new MoneyVO(100, 'USD');

      expect(Object.isFrozen(vo)).toBe(true);
      expect(Object.isFrozen(vo.value)).toBe(false);
    });

    it('should preserve original value', () => {
      const original = { amount: 100, currency: 'USD' };
      const vo = new MoneyVO(100, 'USD');

      original.amount = 999;

      expect(vo.amount).toBe(100);
    });
  });
});
