export { cn } from '@pranakaia/ui';

export function formatPrice(value: number | string, locale = 'es-CL', currency = 'CLP'): string {
  const amount = typeof value === 'string' ? Number(value) : value;

  if (!Number.isFinite(amount)) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'CLP' ? 0 : 2,
    }).format(0);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'CLP' ? 0 : 2,
  }).format(amount);
}
