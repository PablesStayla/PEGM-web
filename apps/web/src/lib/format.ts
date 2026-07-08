/**
 * Formatting utilities for prices, dates, and other display values
 * @module format
 */

/**
 * Formats a price in cents to Chilean Peso currency format
 *
 * @param cents - Amount in cents (e.g., 1500000 = $15.000 CLP)
 * @param currency - Currency code (default: 'CLP')
 * @returns Formatted price string
 *
 * @example
 * formatPrice(1500000) // "$15.000"
 * formatPrice(2500000, 'USD') // "$25,000.00"
 */
export function formatPrice(cents: number, currency = 'CLP'): string {
  const amount = cents / 100;

  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'CLP' ? 0 : 2,
    maximumFractionDigits: currency === 'CLP' ? 0 : 2,
  }).format(amount);
}

/**
 * Formats a date to Chilean locale format
 *
 * @param date - Date object or ISO string
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date()) // "16 de octubre de 2025"
 * formatDate('2025-10-16') // "16 de octubre de 2025"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Formats a date to short format
 *
 * @param date - Date object or ISO string
 * @returns Short formatted date string
 *
 * @example
 * formatDateShort(new Date()) // "16/10/2025"
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Formats a number with thousand separators
 *
 * @param value - Number to format
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1500000) // "1.500.000"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CL').format(value);
}

/**
 * Formats cents to display amount (without currency symbol)
 *
 * @param cents - Amount in cents
 * @returns Formatted amount string
 *
 * @example
 * formatCents(1500000) // "15.000"
 */
export function formatCents(cents: number): string {
  return formatNumber(cents / 100);
}

/**
 * Formats a percentage value
 *
 * @param value - Decimal value (e.g., 0.19 for 19%)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(0.19) // "19%"
 * formatPercentage(0.195, 1) // "19.5%"
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formats a raw CLP amount (pesos, NOT cents) for display.
 * Use this in UI components where prices are stored as whole pesos.
 *
 * @param amount - Amount in Chilean Pesos (e.g., 52600)
 * @returns Formatted string (e.g., "$52.600")
 *
 * @example
 * formatCLP(52600)  // "$52.600"
 * formatCLP(1990)   // "$1.990"
 * formatCLP(0)      // "$0"
 */
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculates and formats the discount percentage between original and current price.
 *
 * @param originalPrice - Original price in CLP
 * @param currentPrice - Current (discounted) price in CLP
 * @returns Formatted discount string (e.g., "-25%") or null if no discount
 *
 * @example
 * formatDiscount(40000, 30000) // "-25%"
 * formatDiscount(10000, 10000) // null
 */
export function formatDiscount(originalPrice: number, currentPrice: number): string | null {
  if (originalPrice <= currentPrice) {
    return null;
  }
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  return `-${discount}%`;
}
