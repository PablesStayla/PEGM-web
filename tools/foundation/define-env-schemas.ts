/**
 * Environment Schemas (Legacy Re-export)
 *
 * Consolidated into /tools/lib/env-validator-types.ts.
 * This file re-exports for backward compatibility.
 *
 * @deprecated Import from '../lib/env-validator-types.js' instead.
 */
export type {
  EnvValidationError,
  EnvVarSchema,
  ValidationResult,
  ValidationSummary,
} from '../lib/env-validator-types.js';

export {
  ALL_ENV_SCHEMAS as ALL_SCHEMAS,
  AUTH_VARS,
  CORE_ENV_VARS,
  envVarSchemaZod,
  PAYMENT_VARS,
  SUPABASE_VARS,
} from '../lib/env-validator-types.js';
