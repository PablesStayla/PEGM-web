/**
 * Audit Secrets — Types
 */
import { z } from 'zod';
import type { Severity } from './secret-patterns-logic.js';

export interface SecretFinding {
  readonly pattern: string;
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly severity: Severity;
  readonly description: string;
  readonly excerpt?: string;
}

export interface ScanResult {
  readonly findings: readonly SecretFinding[];
  readonly filesScanned: number;
}

/** Dependency injection boundary for filesystem scanning */
export interface SecretScanPort {
  readFile(path: string): Promise<string>;
  readDir(path: string): Promise<string[]>;
  isDirectory(path: string): Promise<boolean>;
  shouldIgnore(path: string): boolean;
  scanContent(content: string, filePath: string): SecretFinding[];
}

export const AuditSecretsOptionsSchema = z.object({
  directory: z.string().min(1).optional(),
  verbose: z.boolean().default(false),
  json: z.boolean().default(false),
  dryRun: z.boolean().default(false),
});

export type AuditSecretsOptions = z.infer<typeof AuditSecretsOptionsSchema>;
