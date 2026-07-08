/**
 * Environment Validator Logic — Unit Tests
 *
 * All I/O is mocked. No real filesystem or network calls.
 */
import { describe, expect, it } from 'vitest';
import {
  createSummary,
  maskSecret,
  parseEnvFile,
  validateEnvironment,
  validateEnvVar,
  validateSchemas,
} from '../lib/env-validator-logic.js';
import type { EnvVarSchema } from '../lib/env-validator-types.js';

// ============================================================================
// validateEnvVar
// ============================================================================

describe('validateEnvVar', () => {
  const schema: EnvVarSchema = {
    name: 'DATABASE_URL',
    required: true,
    pattern: /^postgres(ql)?:\/\/.+/i,
    example: 'postgresql://localhost/db',
    description: 'PostgreSQL connection string',
  };

  it('should pass for valid required variable', () => {
    const result = validateEnvVar(schema, { DATABASE_URL: 'postgresql://localhost/db' });
    expect(result.valid).toBe(true);
    expect(result.present).toBe(true);
  });

  it('should fail for missing required variable', () => {
    const result = validateEnvVar(schema, {});
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('missing');
  });

  it('should fail for invalid format', () => {
    const result = validateEnvVar(schema, { DATABASE_URL: 'mysql://localhost' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Invalid format');
  });

  it('should warn for missing optional variable', () => {
    const optSchema: EnvVarSchema = { ...schema, required: false, name: 'REDIS_URL' };
    const result = validateEnvVar(optSchema, {});
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(1);
  });

  it('should pass for present optional variable', () => {
    const optSchema: EnvVarSchema = {
      name: 'REDIS_URL',
      required: false,
      pattern: /^redis:\/\//,
      example: 'redis://localhost',
      description: 'Redis',
    };
    const result = validateEnvVar(optSchema, { REDIS_URL: 'redis://localhost' });
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });
});

// ============================================================================
// validateSchemas
// ============================================================================

describe('validateSchemas', () => {
  it('should validate multiple schemas', () => {
    const schemas: EnvVarSchema[] = [
      { name: 'A', required: true, pattern: /^x/, example: 'x', description: '' },
      { name: 'B', required: false, example: 'y', description: '' },
    ];
    const results = validateSchemas(schemas, { A: 'x1' });
    expect(results).toHaveLength(2);
  });
});

// ============================================================================
// createSummary
// ============================================================================

describe('createSummary', () => {
  it('should calculate summary from results', () => {
    const results = [
      {
        variable: 'A',
        present: true,
        valid: true,
        errors: [] as string[],
        warnings: [] as string[],
      },
      {
        variable: 'B',
        present: false,
        valid: false,
        errors: ['missing'],
        warnings: [] as string[],
      },
    ];
    const summary = createSummary(results);
    expect(summary.total).toBe(2);
    expect(summary.passed).toBe(1);
    expect(summary.failed).toBe(1);
  });
});

// ============================================================================
// validateEnvironment
// ============================================================================

describe('validateEnvironment', () => {
  it('should return success result with summary', () => {
    const result = validateEnvironment([], {});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.total).toBe(0);
    }
  });
});

// ============================================================================
// parseEnvFile
// ============================================================================

describe('parseEnvFile', () => {
  it('should parse key=value pairs', () => {
    const env = parseEnvFile('KEY=value\nOTHER=123');
    expect(env.KEY).toBe('value');
    expect(env.OTHER).toBe('123');
  });

  it('should skip comments and empty lines', () => {
    const env = parseEnvFile('# comment\n\nKEY=val');
    expect(Object.keys(env)).toHaveLength(1);
  });

  it('should handle values with equals signs', () => {
    const env = parseEnvFile('URL=postgres://host?param=a=b');
    expect(env.URL).toBe('postgres://host?param=a=b');
  });

  it('should strip quotes from values', () => {
    const env = parseEnvFile('KEY="quoted"');
    expect(env.KEY).toBe('quoted');
  });
});

// ============================================================================
// maskSecret
// ============================================================================

describe('maskSecret', () => {
  it('should mask short values', () => {
    expect(maskSecret('abc')).toBe('***');
  });

  it('should show first 4 chars for longer values', () => {
    expect(maskSecret('sk_test_1234567890')).toBe('sk_t**************');
  });

  it('should handle undefined', () => {
    expect(maskSecret(undefined)).toBe('***');
  });
});
