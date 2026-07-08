/**
 * i18n Configuration
 * Internationalization setup for multi-language support
 */

export const locales = ['es', 'en', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
};

export const localeFlags: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇺🇸',
  pt: '🇧🇷',
};

/**
 * Get locale from pathname
 */
export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/');
  const locale = segments[1] as Locale;
  return locales.includes(locale) ? locale : defaultLocale;
}

/**
 * Remove locale from pathname
 */
function removeLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/');
  if (locales.includes(segments[1] as Locale)) {
    segments.splice(1, 1);
  }
  return segments.join('/') || '/';
}

/**
 * Add locale to pathname
 */
export function addLocaleToPathname(pathname: string, locale: Locale): string {
  const cleanPath = removeLocaleFromPathname(pathname);
  return locale === defaultLocale ? cleanPath : `/${locale}${cleanPath}`;
}
