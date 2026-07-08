import createIntlMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from '@/i18n/config';

export const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
});
