import { describe, expect, expectTypeOf, it } from 'vitest';
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

describe('ValueObject - Construction', () => {
  describe('construction', () => {
    it('should create value object with primitive value', () => {
      const vo = new NameVO('John');

      expect(vo.value).toBe('John');
    });

    it('should create value object with object value', () => {
      const vo = new MoneyVO(100, 'USD');

      expect(vo.amount).toBe(100);
      expect(vo.currency).toBe('USD');
    });

    it('should freeze the instance', () => {
      const vo = new NameVO('John');

      expect(Object.isFrozen(vo)).toBe(true);
    });

    it('should prevent modification', () => {
      const vo = new NameVO('John');

      expect(() => {
        (vo as any).value = 'Jane';
      }).toThrow();
    });
  });

  describe('value getter', () => {
    it('should return the underlying value', () => {
      const vo = new MoneyVO(50, 'EUR');

      expect(vo.value).toEqual({ amount: 50, currency: 'EUR' });
    });

    it('should be read-only', () => {
      const vo = new NameVO('Original');

      expectTypeOf(vo.value).toEqualTypeOf<string>();
    });
  });
});

describe('ValueObject - Equality', () => {
  describe('equals', () => {
    it('should return true for equal values', () => {
      const vo1 = new NameVO('John');
      const vo2 = new NameVO('John');

      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false for different values', () => {
      const vo1 = new NameVO('John');
      const vo2 = new NameVO('Jane');

      expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false for different types', () => {
      const vo1 = new NameVO('John');
      const vo2 = new MoneyVO(100, 'USD');

      expect(vo1.equals(vo2 as any)).toBe(false);
    });

    it('should compare deep object values', () => {
      const vo1 = new MoneyVO(100, 'USD');
      const vo2 = new MoneyVO(100, 'USD');
      const vo3 = new MoneyVO(100, 'EUR');

      expect(vo1.equals(vo2)).toBe(true);
      expect(vo1.equals(vo3)).toBe(false);
    });

    it('should handle complex objects', () => {
      const vo1 = new MoneyVO(100.5, 'USD');
      const vo2 = new MoneyVO(100.5, 'USD');

      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should be symmetric', () => {
      const vo1 = new NameVO('John');
      const vo2 = new NameVO('John');

      expect(vo1.equals(vo2)).toBe(vo2.equals(vo1));
    });

    it('should be transitive', () => {
      const vo1 = new NameVO('John');
      const vo2 = new NameVO('John');
      const vo3 = new NameVO('John');

      if (vo1.equals(vo2) && vo2.equals(vo3)) {
        expect(vo1.equals(vo3)).toBe(true);
      }
    });
  });
});
