'use client';

import { Toaster } from '@pranakaia/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { lazy, Suspense } from 'react';
import { Toaster as HotToaster } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { env } from '@/lib/env';

interface ProvidersProps {
  children: React.ReactNode;
  messages?: AbstractIntlMessages;
  locale?: string;
}

const SlideOverCart = lazy(() =>
  import('@/components/layout/slide-over-cart').then((m) => ({ default: m.SlideOverCart })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof Error && 'status' in error) {
          const status = (error as Error & { status: number }).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

export function Providers({ children, messages, locale }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider
          locale={locale ?? 'es'}
          messages={messages ?? null}
          timeZone="America/Santiago"
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <HotToaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #374151',
                },
                success: {
                  style: {
                    background: '#10b981',
                    border: '1px solid #059669',
                  },
                  icon: '🌱',
                },
                error: {
                  style: {
                    background: '#ef4444',
                    border: '1px solid #dc2626',
                  },
                  icon: '⚠️',
                },
              }}
            />
            <Toaster />
            {env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
            <Suspense fallback={null}>
              <SlideOverCart />
            </Suspense>
          </ThemeProvider>
        </NextIntlClientProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
