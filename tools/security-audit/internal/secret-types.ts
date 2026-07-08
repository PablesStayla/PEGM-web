/**
 * Secret Audit Types
 * Type definitions for secret detection and auditing
 */

/**
 * Severity levels for secret detection
 */
export type Severity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Secret pattern definition
 */
export interface SecretPattern {
  readonly name: string;
  readonly pattern: RegExp;
  readonly severity: Severity;
  readonly description: string;
}

/**
 * Secret finding result
 */
export interface SecretFinding {
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly pattern: string;
  readonly severity: Severity;
  readonly description: string;
  readonly excerpt?: string;
}

/**
 * Audit result summary
 */
export interface AuditResult {
  readonly filesScanned: number;
  readonly secretsFound: number;
  readonly findings: readonly SecretFinding[];
}

/**
 * File ignore patterns type
 */
export interface FilePattern {
  readonly pattern: RegExp;
  readonly description: string;
}
