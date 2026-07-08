/**
 * Clean Artifacts — Types & Zod Schemas
 *
 * Pure type definitions and validation schemas for artifact cleanup.
 * Zero I/O, zero side effects.
 */

import { z } from 'zod';

// ============================================================================
// Zod Schemas
// ============================================================================

/** Validates the --targets comma-separated string (optional) */
export const TargetsInputSchema = z
  .string()
  .min(1)
  .transform((val) => val.split(',').map((s) => s.trim().toLowerCase()))
  .optional();

/** Validates the --exclude comma-separated string (optional) */
export const ExcludeInputSchema = z
  .string()
  .min(1)
  .transform((val) => val.split(',').map((s) => s.trim()))
  .optional();

/** Validates a filesystem path string */
export const PathSchema = z.string().min(1).max(4096);

/** Validated cleanup options coming from CLI */
export const CleanupOptionsSchema = z.object({
  verbose: z.boolean().default(false),
  json: z.boolean().default(false),
  dryRun: z.boolean().default(false),
  targets: TargetsInputSchema,
  exclude: ExcludeInputSchema,
  rootPath: PathSchema,
});

// ============================================================================
// Inferred Types
// ============================================================================

export type CleanupOptions = z.infer<typeof CleanupOptionsSchema>;

// ============================================================================
// Domain Types (no I/O)
// ============================================================================

export interface CleanupTarget {
  name: string;
  patterns: string[];
  description: string;
  safeToDelete: boolean;
}

export interface CleanupResult {
  path: string;
  success: boolean;
  error?: string;
  size?: number;
}

export interface CleanupReport {
  totalTargets: number;
  cleaned: number;
  failed: number;
  totalSize: number;
  results: CleanupResult[];
}

/** Dependency injection boundary — the shell provides these I/O capabilities */
export interface FileSystemPort {
  readDir(path: string): Promise<string[]>;
  isDirectory(path: string): Promise<boolean>;
  getSize(path: string): Promise<number>;
  remove(path: string): Promise<void>;
}
