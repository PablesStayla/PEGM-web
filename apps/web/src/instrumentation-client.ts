import * as Sentry from '@sentry/nextjs';
import { env, isProd } from '@/lib/env';

const sentryDsn = env.NEXT_PUBLIC_SENTRY_DSN;
const enableReplay = isProd();

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: env.NODE_ENV,
    release: env.NEXT_PUBLIC_APP_VERSION,

    // Performance monitoring
    tracesSampleRate: enableReplay ? 0.1 : 1.0,

    // Session replay — record 10% of sessions in prod, 100% in dev
    replaysSessionSampleRate: enableReplay ? 0.1 : 0,
    replaysOnErrorSampleRate: enableReplay ? 1.0 : 0,

    integrations: enableReplay
      ? [
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: false,
          }),
        ]
      : [],

    // Scrub sensitive data from breadcrumbs/events
    beforeSend(event) {
      // Strip password/token fields from request data
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
  });

  // Bridge: forward logger.error() calls to Sentry
  (globalThis as Record<string, unknown>)['__sentry_error__'] = (
    message: string,
    context?: unknown,
  ) => {
    Sentry.captureMessage(message, { level: 'error', extra: context as Record<string, unknown> });
  };
}

// Required by Sentry v9+ for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
