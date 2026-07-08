/**
 * Validate Environment — Functional Core
 *
 * Pure functions for environment variable validation.
 * Zero I/O — no console.log, no process.env, no filesystem.
 */
import type { EnvDefinition, ValidationResult, ValidationSummary } from './validate-env-types.js';
import { ENV_RULES } from './validate-env-types.js';

// ============================================================================
// Pure Functions
// ============================================================================

/** Parse .env file content into a key-value record */
export function parseEnvContent(content: string): Record<string, string> {
  const env: Record<string, string> = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      env[key] = value;
    }
  }

  return env;
}

/** Validate a single environment variable against its definition */
export function validateEnvVar(def: EnvDefinition, env: Record<string, string>): ValidationResult {
  const value = env[def.name];

  if (def.required && !value) {
    return { variable: def.name, valid: false, error: 'Required variable is missing' };
  }

  if (!value) {
    return { variable: def.name, valid: true };
  }

  try {
    def.schema.parse(value);
    return { variable: def.name, valid: true };
  } catch {
    return { variable: def.name, valid: false, error: 'Invalid format' };
  }
}

/** Validate all environment rules against a given env record */
export function validateAll(env: Record<string, string>, environment: string): ValidationSummary {
  const results = ENV_RULES.map((def) => validateEnvVar(def, env));

  const productionOverrides = checkProductionConstraints(env, environment);
  const allResults = [...results, ...productionOverrides];

  const failed = allResults.filter((r) => !r.valid).length;
  const passed = allResults.length - failed;

  return { results: allResults, passed, failed };
}

/** Production-specific constraint checks */
function checkProductionConstraints(
  env: Record<string, string>,
  environment: string,
): ValidationResult[] {
  if (environment !== 'production') {
    return [];
  }

  const extra: ValidationResult[] = [];

  if (env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
    extra.push({
      variable: 'STRIPE_SECRET_KEY',
      valid: false,
      error: 'Using TEST key in PRODUCTION',
    });
  }

  if (env.FLOW_SANDBOX === 'true') {
    extra.push({
      variable: 'FLOW_SANDBOX',
      valid: false,
      error: 'Using SANDBOX mode in PRODUCTION',
    });
  }

  return extra;
}

/** Mask a secret value for safe logging (show first 4 chars + ***) */
export function maskSecret(value: string | undefined): string {
  if (!value) {
    return '(not set)';
  }
  if (value.length <= 8) {
    return '***';
  }
  return `${value.slice(0, 4)}${'*'.repeat(Math.min(value.length - 4, 20))}`;
}

/** Determine environment type from filename */
export function detectEnvironment(envFilePath: string): string {
  return envFilePath.includes('production') ? 'production' : 'local';
}
