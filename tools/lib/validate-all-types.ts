/**
 * Validate All — Types & Zod Schemas
 */
import { z } from 'zod';

export interface ValidationCheck {
  readonly name: string;
  readonly command: string;
  readonly critical: boolean;
  readonly description?: string;
}

export interface CheckResult {
  readonly check: string;
  readonly passed: boolean;
  readonly duration: number;
  readonly error?: string;
}

export interface ValidationSummary {
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly criticalFailures: number;
  readonly duration: number;
  readonly results: readonly CheckResult[];
}

/** Dependency injection boundary for shell execution */
export interface ExecPort {
  exec(command: string, opts?: { maxBuffer?: number }): Promise<{ stdout: string; stderr: string }>;
}

export const ValidateAllOptionsSchema = z.object({
  checks: z.string().optional(),
  report: z.boolean().default(false),
  verbose: z.boolean().default(false),
  json: z.boolean().default(false),
});

export type ValidateAllOptions = z.infer<typeof ValidateAllOptionsSchema>;
