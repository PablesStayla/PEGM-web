import * as Sentry from '@sentry/nextjs';
import { env, isProduction, isTest } from '@/lib/env';

const sentryDsn = env.NEXT_PUBLIC_SENTRY_DSN;
const isProd = isProduction();

Sentry.init({
  dsn: sentryDsn,
  environment: env.NODE_ENV,
  tracesSampleRate: isProd ? 0.2 : 1.0,
  debug: false,

  // Session Replay — record sessions for debugging admin errors
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  initialScope: { tags: { app: 'admin' } },

  enabled: !isTest() && env.CI !== 'true',
});

// Required by Sentry v9+ for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
