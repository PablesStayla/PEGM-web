'use client';

import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Premium ThemeProvider for PranaKaia Web.
 * Wraps next-themes to provide standard light/dark mode support.
 * Synchronized with the shared ThemeToggle component.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export { useTheme } from 'next-themes';
