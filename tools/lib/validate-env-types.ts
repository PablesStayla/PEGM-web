/**
 * Validate Environment — Types & Zod Schemas
 *
 * Pure type definitions and validation schemas for environment validation.
 * Zero I/O, zero side effects.
 */
import { z } from 'zod';

// ============================================================================
// Zod Schemas for Environment Variable Patterns
// ============================================================================

export const EnvVarPatternSchemas = {
  DATABASE_URL: z.string().regex(/^postgresql:\/\//),
  SUPABASE_URL: z.string().regex(/^https:\/\/[a-z0-9-]+\.supabase\.co$/),
  SUPABASE_KEY: z.string().regex(/^eyJ/),
  STRIPE_KEY: z.string().regex(/^(sk_test_|sk_live_|pk_test_|pk_live_)/),
  UUID: z.string().regex(/^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}$/),
  HEX: z.string().regex(/^[a-f0-9]{40}$/),
  LENGTH_64: z.string().min(64),
  LENGTH_32: z.string().min(32),
  RESEND_KEY: z.string().regex(/^re_[a-zA-Z0-9_-]+$/),
  SENTRY_DSN: z.string().regex(/^https:\/\/.+@.+\.ingest\.[a-z0-9.]+\/\d+$/),
  UPSTASH_URL: z.string().regex(/^https:\/\/[a-z0-9-]+\.upstash\.io$/),
} as const;

// ============================================================================
// Domain Types
// ============================================================================

export interface EnvDefinition {
  readonly name: string;
  readonly required: boolean;
  readonly schema: z.ZodTypeAny;
  readonly description: string;
}

export interface ValidationResult {
  readonly variable: string;
  readonly valid: boolean;
  readonly error?: string;
}

export interface ValidationSummary {
  readonly results: readonly ValidationResult[];
  readonly passed: number;
  readonly failed: number;
}

export interface EnvFileReadResult {
  readonly success: boolean;
  readonly data?: Record<string, string>;
  readonly error?: string;
}

// ============================================================================
// Environment Rules Configuration
// ============================================================================

export const ENV_RULES: readonly EnvDefinition[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    schema: EnvVarPatternSchemas.DATABASE_URL,
    description: 'PostgreSQL connection string',
  },
  {
    name: 'SUPABASE_URL',
    required: true,
    schema: EnvVarPatternSchemas.SUPABASE_URL,
    description: 'Supabase project URL',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    schema: EnvVarPatternSchemas.SUPABASE_KEY,
    description: 'Supabase service role key',
  },
  {
    name: 'SUPABASE_ANON_KEY',
    required: true,
    schema: EnvVarPatternSchemas.SUPABASE_KEY,
    description: 'Supabase anonymous key',
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    schema: EnvVarPatternSchemas.STRIPE_KEY,
    description: 'Stripe secret key',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    schema: EnvVarPatternSchemas.STRIPE_KEY,
    description: 'Stripe publishable key',
  },
  {
    name: 'FLOW_API_KEY',
    required: true,
    schema: EnvVarPatternSchemas.UUID,
    description: 'Flow API key',
  },
  {
    name: 'FLOW_SECRET_KEY',
    required: true,
    schema: EnvVarPatternSchemas.HEX,
    description: 'Flow secret key',
  },
  {
    name: 'ENCRYPTION_KEY',
    required: true,
    schema: EnvVarPatternSchemas.LENGTH_64,
    description: 'Encryption key (min 64 chars)',
  },
  {
    name: 'CSRF_SECRET',
    required: true,
    schema: EnvVarPatternSchemas.LENGTH_32,
    description: 'CSRF secret (min 32 chars)',
  },
  {
    name: 'RESEND_API_KEY',
    required: true,
    schema: EnvVarPatternSchemas.RESEND_KEY,
    description: 'Resend API key',
  },
  {
    name: 'SENTRY_DSN',
    required: true,
    schema: EnvVarPatternSchemas.SENTRY_DSN,
    description: 'Sentry DSN',
  },
  {
    name: 'UPSTASH_REDIS_REST_URL',
    required: true,
    schema: EnvVarPatternSchemas.UPSTASH_URL,
    description: 'Upstash Redis URL',
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    required: true,
    schema: z.string().min(1),
    description: 'Upstash Redis token',
  },
] as const;

// ============================================================================
// CLI Input Schema
// ============================================================================

export const ValidateEnvOptionsSchema = z.object({
  envFile: z.string().min(1).optional(),
  verbose: z.boolean().default(false),
  json: z.boolean().default(false),
});

export type ValidateEnvOptions = z.infer<typeof ValidateEnvOptionsSchema>;
