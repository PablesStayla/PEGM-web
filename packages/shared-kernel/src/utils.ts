/**
 * Shared utility functions — zero external dependencies.
 *
 * @module @pranakaia/shared-kernel/utils
 */

/**
 * Promisified `setTimeout` — pauses execution for the given duration.
 *
 * @param ms - Duration in milliseconds.
 *
 * @example
 * ```ts
 * await sleep(1000); // wait 1 second
 * ```
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Clamps a number between a minimum and maximum value.
 *
 * @param value - The number to clamp.
 * @param min - The lower bound.
 * @param max - The upper bound.
 *
 * @example
 * ```ts
 * clamp(15, 0, 10); // 10
 * clamp(-5, 0, 10); // 0
 * clamp(5, 0, 10);  // 5
 * ```
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Returns `true` if the string is a valid UUID v4.
 *
 * @param s - The string to test.
 *
 * @example
 * ```ts
 * isUUIDv4('550e8400-e29b-41d4-a716-446655440000'); // true
 * isUUIDv4('not-a-uuid');                           // false
 * ```
 */
export const isUUIDv4 = (s: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

/**
 * Returns a random integer between `min` (inclusive) and `max` (exclusive).
 *
 * @param min - Lower bound (inclusive).
 * @param max - Upper bound (exclusive).
 *
 * @example
 * ```ts
 * randomInt(1, 7); // 1, 2, 3, 4, 5, or 6
 * ```
 */
export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min)) + min;

/**
 * Returns `true` if the string is `null`, `undefined`, or only whitespace.
 *
 * @param s - The string to test.
 *
 * @example
 * ```ts
 * isBlank('');       // true
 * isBlank('   ');    // true
 * isBlank(null);     // true
 * isBlank('hello');  // false
 * ```
 */
export const isBlank = (s: string | null | undefined): boolean =>
  s === null || s === undefined || s.trim().length === 0;

/**
 * Slugify a string into a URL-safe identifier.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/[\s_]+/g, '-') // whitespace/underscore → hyphen
    .replace(/-+/g, '-') // collapse consecutive hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

/**
 * Validate an email address.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate a phone number (international, 6-15 digits, no leading zero).
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 15 && !digits.startsWith('0');
}

/**
 * Calculate the integer discount percentage between two prices.
 */
export function calculateDiscount(originalPrice: number, salePrice: number): number {
  if (salePrice >= originalPrice || originalPrice <= 0) {
    return 0;
  }
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Return the stock status string based on quantity.
 */
export function getStockStatus(quantity: number): 'out_of_stock' | 'low_stock' | 'in_stock' {
  if (quantity <= 0) {
    return 'out_of_stock';
  }
  if (quantity < 5) {
    return 'low_stock';
  }
  return 'in_stock';
}

/**
 * Generate a stable URL query string from a plain object.
 */
export function buildQueryString(params: Record<string, string | number | boolean>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
}

/**
 * Truncate a string to maxLength, appending a suffix (default '…').
 */
export function truncate(text: string, maxLength: number, suffix = '\u2026'): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - suffix.length).trimEnd() + suffix;
}

/**
 * Return the plural form based on count.
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const form = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${form}`;
}
