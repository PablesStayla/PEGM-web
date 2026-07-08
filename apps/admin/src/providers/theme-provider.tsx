'use client';

/**
 * ThemeProvider para el panel de administración.
 * Envuelve next-themes para soportar modo oscuro / claro con
 * persistencia en localStorage y sin flash (suppressHydrationWarning).
 *
 * @module providers/theme-provider
 */
import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
