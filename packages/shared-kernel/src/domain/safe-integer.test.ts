import { describe, expect, it } from 'vitest';
import { SafeInteger, SafeIntegerError } from './safe-integer';

describe('SafeInteger — create', () => {
  it('creates a SafeInt from a valid integer', () => {
    const result = SafeInteger.create(42);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(42);
    }
  });

  it('creates SafeInt from zero', () => {
    const result = SafeInteger.create(0);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(0);
    }
  });

  it('creates SafeInt from negative integer', () => {
    const result = SafeInteger.create(-100);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(-100);
    }
  });

  it('creates SafeInt from MIN_SAFE_INTEGER', () => {
    const result = SafeInteger.create(Number.MIN_SAFE_INTEGER);
    expect(result.success).toBe(true);
  });

  it('creates SafeInt from MAX_SAFE_INTEGER', () => {
    const result = SafeInteger.create(Number.MAX_SAFE_INTEGER);
    expect(result.success).toBe(true);
  });

  it('rejects NaN', () => {
    const result = SafeInteger.create(Number.NaN);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorValue).toBeInstanceOf(SafeIntegerError);
      expect(result.errorValue.code).toBe('SAFE_INT_NOT_A_NUMBER');
    }
  });

  it('rejects Infinity', () => {
    const result = SafeInteger.create(Number.POSITIVE_INFINITY);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorValue.code).toBe('SAFE_INT_NOT_FINITE');
    }
  });

  it('rejects -Infinity', () => {
    const result = SafeInteger.create(Number.NEGATIVE_INFINITY);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorValue.code).toBe('SAFE_INT_NOT_FINITE');
    }
  });

  it('rejects decimal number', () => {
    const result = SafeInteger.create(3.14);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorValue.code).toBe('SAFE_INT_NOT_INTEGER');
    }
  });

  it('rejects 0.5', () => {
    const result = SafeInteger.create(0.5);
    expect(result.success).toBe(false);
  });
});

describe('SafeInteger — from (unsafe cast)', () => {
  it('casts without validation', () => {
    const val = SafeInteger.from(9999);
    expect(val).toBe(9999);
  });
});

describe('SafeInteger — zero', () => {
  it('returns 0 as SafeInt', () => {
    expect(SafeInteger.zero()).toBe(0);
  });
});

describe('SafeInteger — add', () => {
  it('adds two positive integers', () => {
    const a = SafeInteger.from(100);
    const b = SafeInteger.from(200);
    const result = SafeInteger.add(a, b);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(300);
    }
  });

  it('adds positive and negative', () => {
    const a = SafeInteger.from(100);
    const b = SafeInteger.from(-50);
    const result = SafeInteger.add(a, b);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(50);
    }
  });

  it('adds zeros', () => {
    const a = SafeInteger.zero();
    const b = SafeInteger.zero();
    const result = SafeInteger.add(a, b);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(0);
    }
  });

  it('fails on overflow', () => {
    const a = SafeInteger.from(Number.MAX_SAFE_INTEGER);
    const b = SafeInteger.from(1);
    const result = SafeInteger.add(a, b);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorValue.code).toBe('SAFE_INT_OVERFLOW');
    }
  });
});

describe('SafeInteger — subtract', () => {
  it('subtracts two integers', () => {
    const a = SafeInteger.from(500);
    const b = SafeInteger.from(200);
    const result = SafeInteger.subtract(a, b);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(300);
    }
  });

  it('subtracts to negative', () => {
    const a = SafeInteger.from(100);
    const b = SafeInteger.from(200);
    const result = SafeInteger.subtract(a, b);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(-100);
    }
  });

  it('fails on underflow', () => {
    const a = SafeInteger.from(Number.MIN_SAFE_INTEGER);
    const b = SafeInteger.from(1);
    const result = SafeInteger.subtract(a, b);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorValue.code).toBe('SAFE_INT_UNDERFLOW');
    }
  });
});

describe('SafeInteger — multiply', () => {
  it('multiplies two positive integers', () => {
    const a = SafeInteger.from(100);
    const b = SafeInteger.from(3);
    const result = SafeInteger.multiply(a, b);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(300);
    }
  });

  it('multiplies by zero', () => {
    const a = SafeInteger.from(9999);
    const b = SafeInteger.zero();
    const result = SafeInteger.multiply(a, b);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(0);
    }
  });

  it('multiplies negative by positive', () => {
    const a = SafeInteger.from(-5);
    const b = SafeInteger.from(10);
    const result = SafeInteger.multiply(a, b);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(-50);
    }
  });

  it('fails on overflow', () => {
    const a = SafeInteger.from(Number.MAX_SAFE_INTEGER);
    const b = SafeInteger.from(2);
    const result = SafeInteger.multiply(a, b);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorValue.code).toBe('SAFE_INT_OVERFLOW');
    }
  });
});

describe('SafeInteger — divide', () => {
  it('divides evenly', () => {
    const a = SafeInteger.from(1000);
    const b = SafeInteger.from(10);
    const result = SafeInteger.divide(a, b);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(100);
    }
  });

  it('rounds when division is not exact (Math.round)', () => {
    const a = SafeInteger.from(1000);
    const b = SafeInteger.from(3);
    const result = SafeInteger.divide(a, b);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(333);
    }
  });

  it('rounds 0.5 up', () => {
    const a = SafeInteger.from(5);
    const b = SafeInteger.from(2);
    const result = SafeInteger.divide(a, b);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(3);
    }
  });

  it('rejects division by zero', () => {
    const a = SafeInteger.from(100);
    const b = SafeInteger.zero();
    const result = SafeInteger.divide(a, b);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorValue.code).toBe('SAFE_INT_DIVISION_BY_ZERO');
    }
  });
});

describe('SafeInteger — abs', () => {
  it('returns positive for positive input', () => {
    expect(SafeInteger.abs(SafeInteger.from(42))).toBe(42);
  });

  it('returns positive for negative input', () => {
    expect(SafeInteger.abs(SafeInteger.from(-42))).toBe(42);
  });

  it('returns zero for zero', () => {
    expect(SafeInteger.abs(SafeInteger.zero())).toBe(0);
  });
});

describe('SafeInteger — negate', () => {
  it('negates a positive integer', () => {
    const result = SafeInteger.negate(SafeInteger.from(42));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(-42);
    }
  });

  it('negates a negative integer', () => {
    const result = SafeInteger.negate(SafeInteger.from(-42));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(42);
    }
  });

  it('fails on MIN_SAFE_INTEGER (overflow)', () => {
    const result = SafeInteger.negate(SafeInteger.from(Number.MIN_SAFE_INTEGER));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorValue.code).toBe('SAFE_INT_OVERFLOW');
    }
  });
});

describe('SafeInteger — applyPercent', () => {
  it('calculates 19% IVA on 10000 cents (1900)', () => {
    const base = SafeInteger.from(10000);
    const ivaBps = SafeInteger.from(1900);
    const result = SafeInteger.applyPercent(base, ivaBps);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(1900);
    }
  });

  it('calculates 1% on 10000 cents (100)', () => {
    const base = SafeInteger.from(10000);
    const onePercentBps = SafeInteger.from(100);
    const result = SafeInteger.applyPercent(base, onePercentBps);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(100);
    }
  });

  it('calculates 0% on any amount (0)', () => {
    const base = SafeInteger.from(50000);
    const zeroBps = SafeInteger.zero();
    const result = SafeInteger.applyPercent(base, zeroBps);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(0);
    }
  });

  it('rounds correctly for non-exact division', () => {
    const base = SafeInteger.from(999);
    const ivaBps = SafeInteger.from(1900);
    const result = SafeInteger.applyPercent(base, ivaBps);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.getValue()).toBe(Math.round((999 * 1900) / 10000));
    }
  });
});

describe('SafeInteger — clamp', () => {
  it('clamps value within range', () => {
    expect(
      SafeInteger.clamp(SafeInteger.from(50), SafeInteger.from(0), SafeInteger.from(100)),
    ).toBe(50);
  });

  it('clamps value below minimum', () => {
    expect(
      SafeInteger.clamp(SafeInteger.from(-10), SafeInteger.from(0), SafeInteger.from(100)),
    ).toBe(0);
  });

  it('clamps value above maximum', () => {
    expect(
      SafeInteger.clamp(SafeInteger.from(150), SafeInteger.from(0), SafeInteger.from(100)),
    ).toBe(100);
  });
});

describe('SafeInteger — isValid', () => {
  it('returns true for valid integer', () => {
    expect(SafeInteger.isValid(42)).toBe(true);
  });

  it('returns false for NaN', () => {
    expect(SafeInteger.isValid(Number.NaN)).toBe(false);
  });

  it('returns false for Infinity', () => {
    expect(SafeInteger.isValid(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it('returns false for decimal', () => {
    expect(SafeInteger.isValid(1.5)).toBe(false);
  });
});

describe('SafeInteger — compare', () => {
  it('returns -1 when a < b', () => {
    expect(SafeInteger.compare(SafeInteger.from(1), SafeInteger.from(2))).toBe(-1);
  });

  it('returns 0 when a === b', () => {
    expect(SafeInteger.compare(SafeInteger.from(5), SafeInteger.from(5))).toBe(0);
  });

  it('returns 1 when a > b', () => {
    expect(SafeInteger.compare(SafeInteger.from(10), SafeInteger.from(5))).toBe(1);
  });
});

describe('SafeInteger — max/min', () => {
  it('max returns larger value', () => {
    expect(SafeInteger.max(SafeInteger.from(3), SafeInteger.from(7))).toBe(7);
  });

  it('min returns smaller value', () => {
    expect(SafeInteger.min(SafeInteger.from(3), SafeInteger.from(7))).toBe(3);
  });

  it('max returns equal value when same', () => {
    expect(SafeInteger.max(SafeInteger.from(5), SafeInteger.from(5))).toBe(5);
  });
});

describe('SafeInteger — Financial Use Case: CLP Pricing', () => {
  function unwrap<T>(result: Result<T, SafeIntegerError>): T {
    expect(result.success).toBe(true);
    return result.success ? result.getValue() : (null as never);
  }

  it('builds full price breakdown from cost + markup + IVA (cents)', () => {
    const costCents = SafeInteger.from(100_000);
    const markupBps = SafeInteger.from(500);
    const ivaBps = SafeInteger.from(1900);

    const markupAmount = SafeInteger.applyPercent(costCents, markupBps);
    expect(unwrap(markupAmount)).toBe(5_000);

    const netPrice = SafeInteger.add(costCents, unwrap(markupAmount));
    expect(unwrap(netPrice)).toBe(105_000);

    const taxAmount = SafeInteger.applyPercent(unwrap(netPrice), ivaBps);
    expect(unwrap(taxAmount)).toBe(19_950);

    const finalPrice = SafeInteger.add(unwrap(netPrice), unwrap(taxAmount));
    expect(unwrap(finalPrice)).toBe(124_950);
  });

  it('extracts IVA from tax-inclusive price (back-calculation)', () => {
    const totalCents = SafeInteger.from(119_000);
    const netResult = SafeInteger.divide(totalCents, SafeInteger.from(119));
    expect(unwrap(netResult)).toBe(1_000);

    const netHundredCents = SafeInteger.multiply(unwrap(netResult), SafeInteger.from(100));
    expect(unwrap(netHundredCents).success ?? true).toBeTruthy();

    const taxResult = SafeInteger.subtract(totalCents, unwrap(netHundredCents));
    expect(unwrap(taxResult)).toBe(19_000);
  });
});
