import { z } from 'zod';

const adminEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CI: z.string().optional(),
  NEXT_RUNTIME: z.string().optional(),

  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),

  ENABLE_LOCAL_ADMIN_BYPASS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),

  CRON_SECRET: z.string().optional(),
  ADMIN_STEP_UP_SECRET: z.string().optional(),
  SUPPLIER_SECRETS_KEY: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

type AdminEnv = z.infer<typeof adminEnvSchema>;

let cachedEnv: AdminEnv | null = null;

function parseAdminEnv(): AdminEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = adminEnvSchema.safeParse(process.env);

  if (!result.success) {
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    console.error(`❌ Invalid admin environment variables:\n${issues}`);

    if (isBuildPhase) {
      console.warn('⚠️  [BUILD PHASE] Proceeding with fallback env vars for static generation...');
      try {
        // Intentamos parsear con lo que haya, asegurando valores para los campos críticos de SSG
        return adminEnvSchema.parse({
          ...process.env,
          NEXT_PUBLIC_SUPABASE_URL:
            process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
        });
      } catch (_e) {
        return process.env as unknown as AdminEnv;
      }
    }

    throw new Error(`Invalid admin environment variables:\n${issues}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export const env: AdminEnv = new Proxy({} as AdminEnv, {
  get(_target, prop: string) {
    return parseAdminEnv()[prop as keyof AdminEnv];
  },
});

export const isProduction = (): boolean => parseAdminEnv().NODE_ENV === 'production';
export const isDevelopment = (): boolean => parseAdminEnv().NODE_ENV === 'development';
export const isTest = (): boolean => parseAdminEnv().NODE_ENV === 'test';
