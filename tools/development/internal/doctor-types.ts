import { z } from 'zod';

export type CheckSeverity = 'required' | 'optional';

export interface CheckDefinition {
  readonly name: string;
  readonly fix: string;
  readonly severity: CheckSeverity;
}

export interface CheckResult {
  readonly name: string;
  readonly passed: boolean;
  readonly severity: CheckSeverity;
  readonly fix?: string;
  readonly error?: string;
}

export interface DoctorReport {
  readonly passed: number;
  readonly failed: number;
  readonly warnings: number;
  readonly results: readonly CheckResult[];
}

export const NodeVersionSchema = z.object({
  major: z.number().int().min(0),
  raw: z.string(),
});

export type NodeVersion = z.infer<typeof NodeVersionSchema>;

export const PnpmVersionSchema = z.object({
  major: z.number().int().min(0),
  raw: z.string(),
});

export type PnpmVersion = z.infer<typeof PnpmVersionSchema>;
