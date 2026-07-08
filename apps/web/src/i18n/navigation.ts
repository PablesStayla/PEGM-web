import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware navigation helpers.
 * Use these instead of Next.js `Link`, `useRouter`, `usePathname`, `redirect`.
 *
 * @example
 * import { Link, useRouter, redirect } from '@/i18n/navigation';
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
