import * as Sentry from '@sentry/nextjs';
import { env, isProd, isTest } from '@/lib/env';

export async function register() {
  const sentryDsn = env.NEXT_PUBLIC_SENTRY_DSN;
  const sentryEnabled = !isTest() && env.CI !== 'true';

  if (!sentryDsn) {
    // Sentry DSN not configured — skipping server-side initialization.
    // Set NEXT_PUBLIC_SENTRY_DSN in .env.local to enable.
    return;
  }

  if (env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: sentryDsn,
      environment: env.NODE_ENV,
      release: env.NEXT_PUBLIC_APP_VERSION,
      tracesSampleRate: isProd() ? 0.1 : 1.0,
      // Do not send errors during CI/test runs
      enabled: sentryEnabled,
    });
  }

  if (env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: sentryDsn,
      environment: env.NODE_ENV,
      tracesSampleRate: isProd() ? 0.05 : 1.0,
      enabled: sentryEnabled,
    });
  }
}

// Required by Sentry v9+ to capture errors from nested React Server Components
export const onRequestError = Sentry.captureRequestError;
