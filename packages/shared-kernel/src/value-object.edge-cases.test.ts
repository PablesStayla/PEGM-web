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

describe('ValueObject - Type Safety', () => {
  describe('type safety', () => {
    it('should enforce value type', () => {
      const stringVO = new NameVO('test');
      expectTypeOf(stringVO.value).toEqualTypeOf<string>();

      const objectVO = new MoneyVO(100, 'USD');
      expectTypeOf(objectVO.value).toEqualTypeOf<{
        amount: number;
        currency: string;
      }>();
    });

    it('should require correct constructor arguments', () => {
      // Type check - should not compile with wrong types
      // new NameVO(123) // Error
      // new MoneyVO('invalid', 'USD') // Error
    });
  });
});

describe('ValueObject - Edge Cases', () => {
  it('should handle null values', () => {
    class NullableVO extends ValueObject<string | null> {}

    const vo = new NullableVO(null);

    expect(vo.value).toBe(null);
  });

  it('should handle undefined values', () => {
    class OptionalVO extends ValueObject<string | undefined> {}

    const vo = new OptionalVO(undefined);

    expect(vo.value).toBeUndefined();
  });

  it('should handle empty string', () => {
    const vo = new NameVO('');

    expect(vo.value).toBe('');
  });

  it('should handle zero', () => {
    const vo = new MoneyVO(0, 'USD');

    expect(vo.amount).toBe(0);
  });

  it('should handle negative numbers', () => {
    const vo = new MoneyVO(-100, 'USD');

    expect(vo.amount).toBe(-100);
  });

  it('should handle very large numbers', () => {
    const vo = new MoneyVO(999999999.99, 'USD');

    expect(vo.amount).toBe(999999999.99);
  });

  it('should handle special characters in strings', () => {
    const vo = new NameVO('John <script>alert("xss")</script>');

    expect(vo.value).toBe('John <script>alert("xss")</script>');
  });

  it('should handle unicode characters', () => {
    const vo = new NameVO('🚀 Hello 世界');

    expect(vo.value).toBe('🚀 Hello 世界');
  });
});

describe('ValueObject - Inheritance', () => {
  class BaseMoneyVO extends ValueObject<{ amount: number; currency: string }> {
    constructor(amount: number, currency: string) {
      super({ amount, currency });
    }
  }

  class ExtendedMoneyVO extends BaseMoneyVO {
    getAmount(): number {
      return this._value.amount;
    }

    getCurrency(): string {
      return this._value.currency;
    }
  }

  it('should support inheritance', () => {
    const vo = new ExtendedMoneyVO(100, 'USD');

    expect(vo.getAmount()).toBe(100);
    expect(vo.getCurrency()).toBe('USD');
  });

  it('should maintain equality through inheritance', () => {
    const vo1 = new ExtendedMoneyVO(100, 'USD');
    const vo2 = new ExtendedMoneyVO(100, 'USD');
    const vo3 = new ExtendedMoneyVO(200, 'USD');

    expect(vo1.equals(vo2)).toBe(true);
    expect(vo1.equals(vo3)).toBe(false);
  });
});
