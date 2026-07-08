import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

/**
 * next-intl routing configuration.
 * ADR-015: Internationalisation (i18n) Strategy
 *
 * - defaultLocale: 'es' (Chilean market is primary)
 * - localePrefix: 'as-needed' — Spanish URLs have no prefix (/productos),
 *   other locales are prefixed (/en/products, /pt/produtos)
 * - localeDetection: true — respects Accept-Language header for first visit
 */
export const routing = defineRouting({
  locales: ['es', 'en', 'pt'],
  defaultLocale: 'es',
  localePrefix: 'as-needed',
});

export const { usePathname, useRouter } = createNavigation(routing);
