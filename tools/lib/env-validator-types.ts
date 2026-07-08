/**
 * Environment Validator — Types & Zod Schemas
 *
 * Consolidated from foundation/define-env-schemas.ts and foundation/env-validator.ts.
 * Pure type definitions and validation schemas.
 * Zero I/O, zero side effects.
 */
import { z } from 'zod';

// ============================================================================
// Domain Types
// ============================================================================

export interface EnvVarSchema {
  readonly name: string;
  readonly required: boolean;
  readonly pattern?: RegExp;
  readonly example: string;
  readonly description: string;
}

export interface EnvValidationError {
  readonly variable: string;
  readonly present: boolean;
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export interface ValidationSummary {
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly warnings: number;
  readonly results: readonly EnvValidationError[];
}

export type ValidationResult =
  | { success: true; data: ValidationSummary }
  | { success: false; error: string };

/** Dependency injection boundary for env file reading */
export interface EnvFilePort {
  readFile(path: string): Promise<string>;
  cwd(): string;
}

// ============================================================================
// Zod Schema for CLI Input
// ============================================================================

export const EnvValidatorOptionsSchema = z.object({
  envFile: z.string().min(1).optional(),
  verbose: z.boolean().default(false),
  json: z.boolean().default(false),
});

export type EnvValidatorOptions = z.infer<typeof EnvValidatorOptionsSchema>;

// ============================================================================
// Zod Schema for EnvVarSchema (runtime validation of config)
// ============================================================================

export const envVarSchemaZod = z.object({
  name: z.string().min(1),
  required: z.boolean(),
  pattern: z.instanceof(RegExp).optional(),
  example: z.string(),
  description: z.string(),
});

// ============================================================================
// Environment Variable Definitions (pure data)
// ============================================================================

export const CORE_ENV_VARS: readonly EnvVarSchema[] = [
  {
    name: 'NODE_ENV',
    required: true,
    pattern: /^(development|production|test)$/,
    example: 'development',
    description: 'Node.js environment',
  },
  {
    name: 'DATABASE_URL',
    required: true,
    pattern: /^postgres(ql)?:\/\/.+/i,
    example: 'postgresql://user:pass@localhost:5432/db',
    description: 'PostgreSQL connection string',
  },
  {
    name: 'REDIS_URL',
    required: false,
    pattern: /^redis:\/\//,
    example: 'redis://localhost:6379',
    description: 'Redis connection string',
  },
] as const;

export const SUPABASE_VARS: readonly EnvVarSchema[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    pattern: /^https:\/\/[a-z0-9-]+\.supabase\.co/i,
    example: 'https://xyz.supabase.co',
    description: 'Supabase project URL',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    pattern: /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
    example: 'eyJ...',
    description: 'Supabase anonymous key',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    pattern: /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
    example: 'eyJ...',
    description: 'Supabase service role key',
  },
] as const;

export const AUTH_VARS: readonly EnvVarSchema[] = [
  {
    name: 'NEXTAUTH_URL',
    required: true,
    pattern: /^https?:\/\//,
    example: 'http://localhost:3000',
    description: 'NextAuth callback URL',
  },
  {
    name: 'NEXTAUTH_SECRET',
    required: true,
    pattern: /^[A-Za-z0-9_-]{32,}$/,
    example: 'random-32-char-secret',
    description: 'NextAuth secret key',
  },
] as const;

export const PAYMENT_VARS: readonly EnvVarSchema[] = [
  {
    name: 'STRIPE_SECRET_KEY',
    required: false,
    pattern: /^sk_(test|live)_[A-Za-z0-9]+$/,
    example: 'sk_test_...',
    description: 'Stripe secret key',
  },
  {
    name: 'STRIPE_PUBLISHABLE_KEY',
    required: false,
    pattern: /^pk_(test|live)_[A-Za-z0-9]+$/,
    example: 'pk_test_...',
    description: 'Stripe publishable key',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: false,
    pattern: /^whsec_[A-Za-z0-9]+$/,
    example: 'whsec_...',
    description: 'Stripe webhook secret',
  },
] as const;

/** All schemas combined */
export const ALL_ENV_SCHEMAS: readonly EnvVarSchema[] = [
  ...CORE_ENV_VARS,
  ...SUPABASE_VARS,
  ...AUTH_VARS,
  ...PAYMENT_VARS,
] as const;
