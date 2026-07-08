import { describe, expect, it } from 'vitest';
import {
  formatCents,
  formatCLP,
  formatDate,
  formatDateShort,
  formatDiscount,
  formatNumber,
  formatPercentage,
  formatPrice,
} from './format';

/**
 * Note: Intl.NumberFormat output is environment-dependent (locale, OS).
 * We verify the structural shape (presence of digits, symbol) rather than
 * exact string equality to keep tests portable across CI environments.
 */

// â”€â”€ formatPrice() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('formatPrice()', () => {
  it('formats CLP cents as pesos (divides by 100)', () => {
    const result = formatPrice(1_500_000);
    // Should contain the digits for 15.000 (in some grouping format)
    expect(result).toContain('15');
    expect(result).toContain('000');
  });

  it('produces no decimal places for CLP', () => {
    const result = formatPrice(1_000_050); // 10000.50 pesos
    // CLP has 0 fraction digits; should not show ".50"
    expect(result).not.toMatch(/[.,]5/);
  });

  it('uses currency symbol / code', () => {
    const result = formatPrice(1_000_000, 'CLP');
    expect(result).toMatch(/\$|CLP/);
  });

  it('formats USD with 2 decimal places', () => {
    const result = formatPrice(1_000_000, 'USD');
    // 10000.00 USD
    expect(result).toMatch(/[.,]00/);
  });

  it('formats 0 without crashing', () => {
    expect(() => formatPrice(0)).not.toThrow();
    expect(formatPrice(0)).toBeDefined();
  });
});

// â”€â”€ formatCLP() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('formatCLP()', () => {
  it('formats whole-peso amounts (no /100 conversion)', () => {
    const result = formatCLP(52_600);
    expect(result).toContain('52');
    // Should NOT show decimals for CLP (no comma or dot followed by exactly two digits at the end)
    expect(result).not.toMatch(/[.,]\d\d$/);
  });

  it('formats 0 correctly', () => {
    const result = formatCLP(0);
    expect(result).toContain('0');
  });

  it('formats 1990 correctly', () => {
    const result = formatCLP(1_990);
    expect(result).toContain('1');
    expect(result).toContain('990');
  });

  it('includes currency indicator', () => {
    const result = formatCLP(10_000);
    expect(result).toMatch(/\$|CLP/);
  });
});

// â”€â”€ formatDate() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('formatDate()', () => {
  it('accepts a Date object and returns a non-empty string', () => {
    const result = formatDate(new Date('2025-01-15'));
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('accepts an ISO string', () => {
    const result = formatDate('2025-06-20');
    expect(typeof result).toBe('string');
    expect(result).toContain('2025');
  });

  it('includes the year', () => {
    expect(formatDate('2024-12-01')).toContain('2024');
  });
});

// â”€â”€ formatDateShort() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('formatDateShort()', () => {
  it('produces a compact date string', () => {
    const result = formatDateShort('2025-03-19');
    expect(typeof result).toBe('string');
    expect(result).toContain('2025');
  });

  it('result is shorter than formatDate', () => {
    const date = '2025-03-19';
    expect(formatDateShort(date).length).toBeLessThan(formatDate(date).length);
  });
});

// â”€â”€ formatNumber() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('formatNumber()', () => {
  it('formats 0', () => expect(formatNumber(0)).toBe('0'));

  it('groups thousands with locale separator', () => {
    const result = formatNumber(1_500_000);
    // Chilean locale uses '.' as thousand separator
    expect(result).toContain('1');
    expect(result).toContain('500');
    expect(result).toContain('000');
  });

  it('does not include decimal part for integers', () => {
    const result = formatNumber(1_000);
    expect(result).not.toContain(',');
  });
});

// â”€â”€ formatCents() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('formatCents()', () => {
  it('divides by 100 and formats', () => {
    const result = formatCents(1_500_000);
    expect(result).toContain('15');
  });

  it('handles 0', () => {
    expect(formatCents(0)).toBe('0');
  });
});

// â”€â”€ formatPercentage() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('formatPercentage()', () => {
  it('formats 0.19 as "19%"', () => expect(formatPercentage(0.19)).toBe('19%'));
  it('formats 0 as "0%"', () => expect(formatPercentage(0)).toBe('0%'));
  it('formats 1 as "100%"', () => expect(formatPercentage(1)).toBe('100%'));

  it('respects decimal places', () => {
    expect(formatPercentage(0.195, 1)).toBe('19.5%');
  });

  it('formats 0.5 as "50%" with no decimals', () => {
    expect(formatPercentage(0.5)).toBe('50%');
  });
});

// â”€â”€ formatDiscount() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('formatDiscount()', () => {
  it('returns "-25%" for 25% off', () => {
    expect(formatDiscount(40_000, 30_000)).toBe('-25%');
  });

  it('returns null when prices are equal', () => {
    expect(formatDiscount(10_000, 10_000)).toBeNull();
  });

  it('returns null when currentPrice > originalPrice', () => {
    expect(formatDiscount(5_000, 6_000)).toBeNull();
  });

  it('rounds discount to nearest integer', () => {
    const result = formatDiscount(30_000, 20_000);
    expect(result).toBe('-33%');
  });

  it('returns "-100%" for fully discounted price', () => {
    expect(formatDiscount(10_000, 0)).toBe('-100%');
  });
});
