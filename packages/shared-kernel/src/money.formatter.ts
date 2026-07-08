import type { Money } from './money';

/** Formats the monetary value for display using Intl.NumberFormat. */
export function moneyFormat(self: Money, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: self.currency,
  }).format(self.amount);
}
