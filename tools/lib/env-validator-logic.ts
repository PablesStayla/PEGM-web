/**
 * Environment Validator — Functional Core
 *
 * Pure functions for environment variable validation with Result pattern.
 * Consolidated from foundation/env-validator-logic.ts.
 * Zero I/O — no console.log, no process.env, no filesystem.
 */
import type {
  EnvValidationError,
  EnvVarSchema,
  ValidationResult,
  ValidationSummary,
} from './env-validator-types.js';

// ============================================================================
// Pure Functions
// ============================================================================

/** Validate a single environment variable against its schema */
export function validateEnvVar(
  schema: EnvVarSchema,
  env: Record<string, string | undefined>,
): EnvValidationError {
  const value = env[schema.name];
  const present = value !== undefined && value !== '';
  const errors: string[] = [];
  const warnings: string[] = [];

  if (schema.required && !present) {
    errors.push(`Required variable "${schema.name}" is missing`);
  }

  if (present && schema.pattern && !schema.pattern.test(value!)) {
    errors.push(`Invalid format for "${schema.name}". Expected: ${schema.example}`);
  }

  if (!schema.required && !present) {
    warnings.push(`Optional variable "${schema.name}" is not set`);
  }

  return { variable: schema.name, present, valid: errors.length === 0, errors, warnings };
}

/** Validate multiple schemas against an env record */
export function validateSchemas(
  schemas: readonly EnvVarSchema[],
  env: Record<string, string | undefined>,
): readonly EnvValidationError[] {
  return schemas.map((schema) => validateEnvVar(schema, env));
}

/** Build a validation summary from individual results */
export function createSummary(results: readonly EnvValidationError[]): ValidationSummary {
  const total = results.length;
  const passed = results.filter((r) => r.valid).length;
  const failed = total - passed;
  const warnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
  return { total, passed, failed, warnings, results };
}

/** Full validation pipeline returning a Result type */
export function validateEnvironment(
  schemas: readonly EnvVarSchema[],
  env: Record<string, string | undefined>,
): ValidationResult {
  try {
    const results = validateSchemas(schemas, env);
    const summary = createSummary(results);
    return { success: true, data: summary };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown validation error';
    return { success: false, error: message };
  }
}

/** Parse .env file content into a key-value record */
export function parseEnvFile(content: string): Record<string, string | undefined> {
  const env: Record<string, string | undefined> = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');

    if (key?.trim()) {
      env[key.trim()] = value;
    }
  }

  return env;
}

/** Mask a secret for safe logging */
export function maskSecret(value: string | undefined): string {
  if (!value || value.length <= 8) {
    return '***';
  }
  return `${value.slice(0, 4)}${'*'.repeat(Math.min(value.length - 4, 20))}`;
}
