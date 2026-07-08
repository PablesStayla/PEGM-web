/**
 * @file apps/web/src/lib/env.ts
 *
 * Validated, type-safe environment variable access.
 *
 * Uses a lazy singleton so the schema is only parsed once per process
 * and module-level imports in test environments don’t crash immediately
 * when secrets are absent (tests set values in vitest.setup.ts beforeAll).
 *
 * Usage:
 *   import { env, isProd, isDev } from '@/lib/env';
 *   if (isProd) { ... }
 *   const key = env.STRIPE_SECRET_KEY;
 */

import { z } from 'zod';

// ── Schema ────────────────────────────────────────────────────────────────────

const envSchema = z.object({
  // ── Public (exposed to browser) ─────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default('PranaKaia'),
  NEXT_PUBLIC_PAYMENT_GATEWAY: z.enum(['FLOW', 'STRIPE', 'PAYPAL']).default('FLOW'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().default('1x00000000000000000000AA'),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),

  // ── Runtime ──────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_RUNTIME: z.string().optional(),
  CI: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  SERVICE_NAME: z.string().default('pranakaia-web'),

  // ── Stripe ────────────────────────────────────────────────────────────────
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_MODE: z.enum(['sandbox', 'live']).default('sandbox'),
  FLOW_API_KEY: z.string().optional(),
  FLOW_SECRET_KEY: z.string().optional(),
  FLOW_SANDBOX: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  AMPLITUDE_API_KEY: z.string().optional(),

  // ── Database ─────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().url().optional(),
  ENCRYPTION_KEY: z.string().optional(),

  // ── Upstash Redis ─────────────────────────────────────────────────────────
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ── Auth (Supabase) ───────────────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_PROJECT_ID: z.string().optional(),
  SUPABASE_ACCESS_TOKEN: z.string().optional(),

  // ── Email (Resend) ────────────────────────────────────────────────────────
  RESEND_API_KEY: z.string().startsWith('re_').optional(),
  RESEND_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
  SENDGRID_API_KEY: z.string().optional(),
  EMAIL_AUTH_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  EMAIL_USER: z.string().default('noreply@pranakaia.com'),
  EMAIL_PASSWORD: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  SUPPLIER_API_URL: z.string().url().optional(),
  SUPPLIER_API_KEY: z.string().optional(),
  SUPPLIER_WEBHOOK_SECRET: z.string().optional(),

  // ── Monitoring (Sentry) ────────────────────────────────────────────────────
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  // ── Feature flags ───────────────────────────────────────────────────────
  ENABLE_ADMIN_PANEL: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  ENABLE_ANALYTICS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),

  // ── Build ───────────────────────────────────────────────────────────────────
  ANALYZE: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  VERCEL: z.string().optional(),
  VERCEL_TOKEN: z.string().optional(),
  VERCEL_ORG_ID: z.string().optional(),
  VERCEL_PROJECT_ID: z.string().optional(),
  VERCEL_DEPLOYMENT_ID: z.string().optional(),
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  NEXT_PHASE: z.string().optional(),
  NEXT_TELEMETRY_DISABLED: z.string().optional(),
  CSRF_SECRET: z.string().optional(),
  DISCORD_WEBHOOK_URL: z.string().optional(),
  DISCORD_WEBHOOK_SALES: z.string().optional(),
  DISCORD_WEBHOOK_ERRORS: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

// ── Lazy singleton ───────────────────────────────────────────────────────────────

let _env: Env | null = null;

function parseEnv(): Env {
  if (_env) {
    return _env;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(
      `❌ Invalid environment variables:\n${issues}\n\nCheck your .env file against .env.example.`,
    );
  }

  _env = result.data;
  return _env;
}

// ── Exports ─────────────────────────────────────────────────────────────────────

/**
 * Validated environment variables. Throws once on first access if invalid.
 * Safe to destructure — never returns undefined for optional fields
 * (they resolve to undefined, not throw).
 */
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return parseEnv()[prop as keyof Env];
  },
});

/** True when NODE_ENV === 'production' */
export const isProd = (): boolean => parseEnv().NODE_ENV === 'production';

/** True when NODE_ENV === 'development' */
export const isDev = (): boolean => parseEnv().NODE_ENV === 'development';

/** True when NODE_ENV === 'test' */
export const isTest = (): boolean => parseEnv().NODE_ENV === 'test';

/**
 * Flush the parsed env cache.
 * Only needed in tests that modify process.env between test cases.
 */
export function resetEnvCache(): void {
  _env = null;
}
