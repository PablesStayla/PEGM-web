/**
 * Validate Environment Logic — Unit Tests
 *
 * All I/O is mocked. No real filesystem or network calls.
 */
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  detectEnvironment,
  maskSecret,
  parseEnvContent,
  validateAll,
  validateEnvVar,
} from '../lib/validate-env-logic.js';
import type { EnvDefinition } from '../lib/validate-env-types.js';

// ============================================================================
// parseEnvContent
// ============================================================================

describe('parseEnvContent', () => {
  it('should parse valid .env content', () => {
    const content =
      'DATABASE_URL=postgresql://localhost:5432/db\nSUPABASE_URL=https://abc.supabase.co';
    const result = parseEnvContent(content);
    expect(result.DATABASE_URL).toBe('postgresql://localhost:5432/db');
    expect(result.SUPABASE_URL).toBe('https://abc.supabase.co');
  });

  it('should skip comments', () => {
    const result = parseEnvContent('# Comment\nDATABASE_URL=postgresql://localhost:5432/db');
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('should handle empty content', () => {
    expect(parseEnvContent('')).toEqual({});
  });

  it('should skip malformed lines', () => {
    const result = parseEnvContent('DATABASE_URL=pg://db\nMALFORMED_LINE\nKEY=val');
    expect(Object.keys(result)).toHaveLength(2);
  });

  it('should strip quotes from values', () => {
    const result = parseEnvContent('KEY="quoted value"\nOTHER=\'single\'');
    expect(result.KEY).toBe('quoted value');
    expect(result.OTHER).toBe('single');
  });
});

// ============================================================================
// validateEnvVar
// ============================================================================

describe('validateEnvVar', () => {
  const urlSchema = z.string().url();
  const hexSchema = z.string().regex(/^[a-f0-9]+$/);

  it('should pass when required variable is present and valid', () => {
    const def: EnvDefinition = { name: 'URL', required: true, schema: urlSchema, description: '' };
    const result = validateEnvVar(def, { URL: 'https://example.com' });
    expect(result.valid).toBe(true);
  });

  it('should fail when required variable is missing', () => {
    const def: EnvDefinition = { name: 'URL', required: true, schema: urlSchema, description: '' };
    const result = validateEnvVar(def, {});
    expect(result.valid).toBe(false);
    expect(result.error).toContain('missing');
  });

  it('should fail when variable has invalid format', () => {
    const def: EnvDefinition = { name: 'HEX', required: true, schema: hexSchema, description: '' };
    const result = validateEnvVar(def, { HEX: 'not-hex' });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid format');
  });

  it('should pass when optional variable is missing', () => {
    const def: EnvDefinition = { name: 'OPT', required: false, schema: urlSchema, description: '' };
    const result = validateEnvVar(def, {});
    expect(result.valid).toBe(true);
  });
});

// ============================================================================
// validateAll
// ============================================================================

describe('validateAll', () => {
  it('should detect missing required variables', () => {
    const result = validateAll({}, 'local');
    expect(result.failed).toBeGreaterThan(0);
  });

  it('should flag test Stripe key in production', () => {
    const env = {
      DATABASE_URL: 'postgresql://localhost/db',
      SUPABASE_URL: 'https://abc.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJtest',
      SUPABASE_ANON_KEY: 'eyJtest',
      STRIPE_SECRET_KEY: 'sk_test_abc123',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_abc123',
      FLOW_API_KEY: 'ABCD1234-EFGH-5678-IJKL-910111213141',
      FLOW_SECRET_KEY: 'a'.repeat(40),
      ENCRYPTION_KEY: 'x'.repeat(64),
      CSRF_SECRET: 'y'.repeat(32),
      RESEND_API_KEY: 're_test123',
      SENTRY_DSN: 'https://abc@sentry.ingest.io/1',
      UPSTASH_REDIS_REST_URL: 'https://abc.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'token123',
    };
    const result = validateAll(env, 'production');
    const stripeResult = result.results.find(
      (r) => r.variable === 'STRIPE_SECRET_KEY' && r.error?.includes('TEST'),
    );
    expect(stripeResult).toBeDefined();
  });

  it('should NOT flag test key in local environment', () => {
    const env: Record<string, string> = {};
    const result = validateAll(env, 'local');
    const prodErrors = result.results.filter((r) => r.error?.includes('PRODUCTION'));
    expect(prodErrors).toHaveLength(0);
  });
});

// ============================================================================
// maskSecret
// ============================================================================

describe('maskSecret', () => {
  it('should return (not set) for undefined', () => {
    expect(maskSecret(undefined)).toBe('(not set)');
  });

  it('should mask short values completely', () => {
    expect(maskSecret('abc')).toBe('***');
  });

  it('should show first 4 chars + asterisks', () => {
    expect(maskSecret('sk_test_1234567890')).toBe('sk_t**************');
  });
});

// ============================================================================
// detectEnvironment
// ============================================================================

describe('detectEnvironment', () => {
  it('should detect production from filename', () => {
    expect(detectEnvironment('.env.production')).toBe('production');
  });

  it('should default to local', () => {
    expect(detectEnvironment('.env.local')).toBe('local');
  });
});
