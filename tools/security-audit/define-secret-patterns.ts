/**
 * Secret Detection Patterns (Re-export)
 *
 * Logic moved to /tools/lib/define-secret-patterns-logic.ts.
 * This file re-exports for backward compatibility.
 */

export type { SecretPattern, Severity } from '../lib/secret-patterns-logic.js';
export {
  IGNORE_PATTERNS,
  SECRET_PATTERNS,
  shouldIgnoreFile,
  sortBySeverity,
} from '../lib/secret-patterns-logic.js';
