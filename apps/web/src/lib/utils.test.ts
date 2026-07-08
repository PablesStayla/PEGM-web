import { describe, expect, it } from 'vitest';
import {
  buildQueryString,
  calculateDiscount,
  clamp,
  cn,
  getStockStatus,
  isValidEmail,
  isValidPhone,
  pluralize,
  slugify,
  truncate,
} from './utils';

// â”€â”€ cn() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('ignores falsy values', () => {
    expect(cn('px-4', false && 'hidden', undefined, null as never)).toBe('px-4');
  });

  it('handles conditional classes', () => {
    expect(cn('base', true && 'active', false && 'inactive')).toBe('base active');
  });
});

// â”€â”€ slugify() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('slugify()', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips accented characters', () => {
    expect(slugify('Kit HidroponÃ­a Pro')).toBe('kit-hidroponia-pro');
  });

  it('trims leading and trailing whitespace', () => {
    expect(slugify('  LED 300W  ')).toBe('led-300w');
  });

  it('collapses multiple spaces/hyphens into one', () => {
    expect(slugify('a   b---c')).toBe('a-b-c');
  });

  it('handles already-slugified input', () => {
    expect(slugify('already-a-slug')).toBe('already-a-slug');
  });

  it('strips special characters', () => {
    expect(slugify('precio: $1.990!')).toBe('precio-1990');
  });
});

// â”€â”€ isValidEmail() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('isValidEmail()', () => {
  it.each([
    ['user@example.com', true],
    ['user+tag@sub.domain.org', true],
    ['a@b.io', true],
    ['', false],
    ['not-an-email', false],
    ['@missing-local.com', false],
    ['missing-at.com', false],
    ['user@', false],
    ['user @example.com', false],
  ])('isValidEmail(%s) === %s', (email, expected) => {
    expect(isValidEmail(email)).toBe(expected);
  });
});

// â”€â”€ isValidPhone() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('isValidPhone()', () => {
  it.each([
    ['+56912345678', true],
    ['912345678', true],
    ['123456', true], // min 6 digits
    ['0912345678', false], // starts with 0
    ['123', false], // too short
    ['1234567890123456', false], // too long (>15)
  ])('isValidPhone(%s) === %s', (phone, expected) => {
    expect(isValidPhone(phone)).toBe(expected);
  });
});

// â”€â”€ calculateDiscount() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('calculateDiscount()', () => {
  it('calculates 25% discount correctly', () => {
    expect(calculateDiscount(40_000, 30_000)).toBe(25);
  });

  it('rounds to nearest integer', () => {
    expect(calculateDiscount(30_000, 20_001)).toBe(33); // 33.33...
  });

  it('returns 0 when prices are equal', () => {
    expect(calculateDiscount(10_000, 10_000)).toBe(0);
  });

  it('returns 0 when salePrice > originalPrice', () => {
    expect(calculateDiscount(5_000, 6_000)).toBe(0);
  });

  it('returns 0 when originalPrice is 0 (no division by zero)', () => {
    expect(calculateDiscount(0, 0)).toBe(0);
  });

  it('returns 100% for a fully-discounted price', () => {
    expect(calculateDiscount(10_000, 0)).toBe(100);
  });
});

// â”€â”€ getStockStatus() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('getStockStatus()', () => {
  it.each([
    [0, 'out_of_stock'],
    [-1, 'out_of_stock'], // negative quantities treated as 0
    [1, 'low_stock'],
    [4, 'low_stock'], // boundary: < 5
    [5, 'in_stock'], // boundary: exactly 5
    [100, 'in_stock'],
  ])('getStockStatus(%i) === %s', (qty, expected) => {
    expect(getStockStatus(qty)).toBe(expected);
  });
});

// â”€â”€ clamp() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('clamp()', () => {
  it('returns min when value is below range', () => expect(clamp(-5, 0, 100)).toBe(0));
  it('returns max when value is above range', () => expect(clamp(150, 0, 100)).toBe(100));
  it('returns value when within range', () => expect(clamp(42, 0, 100)).toBe(42));
  it('handles equal min and max', () => expect(clamp(99, 50, 50)).toBe(50));
});

// â”€â”€ buildQueryString() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('buildQueryString()', () => {
  it('sorts keys alphabetically for cache stability', () => {
    expect(buildQueryString({ q: 'led', page: 2 })).toBe('page=2&q=led');
  });

  it('encodes special characters', () => {
    expect(buildQueryString({ q: 'kit hidroponÃ­a' })).toBe('q=kit%20hidropon%C3%ADa');
  });

  it('filters empty string values', () => {
    expect(buildQueryString({ a: 'x', b: '' })).toBe('a=x');
  });

  it('returns empty string for empty object', () => {
    expect(buildQueryString({})).toBe('');
  });
});

// â”€â”€ truncate() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('truncate()', () => {
  it('truncates long strings and appends ellipsis', () => {
    expect(truncate('Hello World', 8)).toBe('Hello W\u2026');
  });

  it('does not truncate short strings', () => {
    expect(truncate('Short', 100)).toBe('Short');
  });

  it('uses custom suffix', () => {
    expect(truncate('Hello World', 7, '...')).toBe('Hell...');
  });

  it('returns exact string when length matches', () => {
    expect(truncate('12345', 5)).toBe('12345');
  });
});

// â”€â”€ pluralize() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('pluralize()', () => {
  it('returns singular for count 1', () => expect(pluralize(1, 'producto')).toBe('1 producto'));
  it('returns plural (auto) for count 0', () =>
    expect(pluralize(0, 'producto')).toBe('0 productos'));
  it('returns plural (auto) for count > 1', () => expect(pluralize(5, 'item')).toBe('5 items'));
  it('uses explicit plural when provided', () =>
    expect(pluralize(2, 'luz', 'luces')).toBe('2 luces'));
  it('uses explicit plural for count 1 only if 1', () =>
    expect(pluralize(1, 'luz', 'luces')).toBe('1 luz'));
});
