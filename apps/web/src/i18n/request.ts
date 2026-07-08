import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * Per-request locale configuration for next-intl.
 * Loads the correct message bundle based on the resolved locale.
 *
 * Message files live at: apps/web/messages/{locale}.json
 * ADR-015: Internationalisation (i18n) Strategy
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale is the locale resolved from the URL or the default
  let locale = await requestLocale;

  // Fallback to default if locale is undefined or not in the list
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    timeZone: 'America/Santiago',
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
