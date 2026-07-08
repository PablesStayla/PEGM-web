/**
 * Environment Validator Logic (Legacy Re-export)
 *
 * Consolidated into /tools/lib/env-validator-logic.ts.
 * This file re-exports for backward compatibility.
 *
 * @deprecated Import from '../../lib/env-validator-logic.js' instead.
 */

export {
  createSummary,
  validateEnvironment,
  validateEnvVar,
  validateSchemas,
} from '../../lib/env-validator-logic.js';
export type {
  EnvValidationError,
  ValidationResult,
  ValidationSummary,
} from '../../lib/env-validator-types.js';
