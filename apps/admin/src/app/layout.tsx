import { Toaster } from '@pranakaia/ui';
import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { type ReactNode, Suspense } from 'react';
import { ThemeProvider } from '@/providers/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin - PranaKaia',
  description: 'Panel de administración PranaKaia',
  icons: {
    icon: '/logos/pranakaia-icon-new.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <Suspense fallback={null}>
              {children}
              <Toaster />
            </Suspense>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
