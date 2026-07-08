/**
 * Validation Runner Types
 */
export interface ValidationResult {
  readonly check: string;
  readonly passed: boolean;
  readonly duration: number;
  readonly error?: string;
}

export type CheckStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

export interface ValidationSummary {
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly criticalFailures: number;
  readonly duration: number;
  readonly results: readonly ValidationResult[];
}
