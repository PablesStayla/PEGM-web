import * as Sentry from '@sentry/nextjs';
import { env, isProduction, isTest } from '@/lib/env';

const isProd = isProduction();

export async function register() {
  const sentryDsn = env.NEXT_PUBLIC_SENTRY_DSN;
  const sentryEnabled = !isTest() && env.CI !== 'true';

  if (!sentryDsn) {
    // Add NEXT_PUBLIC_SENTRY_DSN to apps/admin/.env.local to enable.
    return;
  }

  if (env.NEXT_RUNTIME === 'nodejs') {
    const { hardenLodashTemplateRuntime } = await import(
      '@/lib/security/lodash-template-hardening'
    );
    await hardenLodashTemplateRuntime();

    Sentry.init({
      dsn: sentryDsn,
      environment: env.NODE_ENV,
      release: env.NEXT_PUBLIC_APP_VERSION,
      initialScope: { tags: { app: 'admin' } },
      tracesSampleRate: isProd ? 0.2 : 1.0,
      profilesSampleRate: isProd ? 0.2 : 1.0,
      integrations: [Sentry.captureConsoleIntegration({ levels: ['error'] })],
      beforeSend(event) {
        if (event.request?.data && typeof event.request.data === 'object') {
          const sensitive = ['password', 'token', 'secret', 'apiKey', 'api_key'];
          const data = event.request.data as Record<string, unknown>;
          for (const key of sensitive) {
            if (key in data) {
              data[key] = '[Filtered]';
            }
          }
        }
        return event;
      },
      enabled: sentryEnabled,
    });
  }

  if (env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: sentryDsn,
      environment: env.NODE_ENV,
      initialScope: { tags: { app: 'admin' } },
      tracesSampleRate: isProd ? 0.1 : 1.0,
      enabled: sentryEnabled,
    });
  }
}

// Required by Sentry v9+ to capture errors from nested React Server Components
export const onRequestError = Sentry.captureRequestError;
