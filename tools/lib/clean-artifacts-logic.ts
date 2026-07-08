/**
 * Clean Artifacts — Functional Core
 *
 * Pure functions for artifact cleanup logic.
 * Zero I/O — all side effects injected via FileSystemPort.
 */

import { DANGEROUS_PATTERNS } from './clean-artifacts-data.js';
import type {
  CleanupOptions,
  CleanupReport,
  CleanupResult,
  CleanupTarget,
  FileSystemPort,
} from './clean-artifacts-types.js';
import { CleanupOptionsSchema } from './clean-artifacts-types.js';

// Re-export data for consumers
export { CLEANUP_TARGETS, DANGEROUS_PATTERNS } from './clean-artifacts-data.js';

// ============================================================================
// Pure Functions
// ============================================================================

/** Check if a pattern should be skipped at root level */
export function shouldSkipPattern(name: string, isRoot: boolean): boolean {
  return isRoot && DANGEROUS_PATTERNS.includes(name as (typeof DANGEROUS_PATTERNS)[number]);
}

/** Check if an entry name matches any of the given patterns */
export function matchesPattern(entryName: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.includes('*')) {
      return new RegExp(`^${pattern.replace(/\*/g, '.*')}$`).test(entryName);
    }
    return entryName === pattern;
  });
}

/** Filter cleanup targets based on user options */
export function filterTargets(
  targets: readonly CleanupTarget[],
  targetTypes?: string[],
  excludePatterns?: string[],
): CleanupTarget[] {
  return targets
    .filter((t) =>
      targetTypes?.length ? targetTypes.includes(t.name.toLowerCase()) : t.safeToDelete,
    )
    .filter((t) => !excludePatterns?.some((ex) => t.patterns.some((p) => p.includes(ex))));
}

/** Format bytes into human-readable string */
export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
}

/** Build a cleanup report from individual results */
export function buildReport(results: CleanupResult[]): CleanupReport {
  const successful = results.filter((r) => r.success);
  return {
    totalTargets: results.length,
    cleaned: successful.length,
    failed: results.length - successful.length,
    totalSize: successful.reduce((sum, r) => sum + (r.size || 0), 0),
    results,
  };
}

/** Scan a directory tree and return matching cleanup results */
export async function scanAndClean(
  fs: FileSystemPort,
  rootPath: string,
  patterns: readonly string[],
  dryRun: boolean,
  isRoot: boolean,
): Promise<CleanupResult[]> {
  const results: CleanupResult[] = [];
  let entries: string[];

  try {
    entries = await fs.readDir(rootPath);
  } catch {
    return results;
  }

  for (const entry of entries) {
    const entryPath = `${rootPath}/${entry}`;
    if (shouldSkipPattern(entry, isRoot)) {
      continue;
    }
    if (matchesPattern(entry, patterns)) {
      results.push(await removeEntry(fs, entryPath, dryRun));
    }
    if ((await fs.isDirectory(entryPath)) && entry !== 'node_modules') {
      results.push(...(await scanAndClean(fs, entryPath, patterns, dryRun, false)));
    }
  }

  return results;
}

/** Remove a single entry or measure it in dry-run mode */
async function removeEntry(
  fs: FileSystemPort,
  path: string,
  dryRun: boolean,
): Promise<CleanupResult> {
  try {
    const size = await fs.getSize(path);
    if (!dryRun) {
      await fs.remove(path);
    }
    return { path, success: true, size };
  } catch (error) {
    return { path, success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Validate raw CLI input through Zod */
export function validateOptions(
  raw: unknown,
): { success: true; data: CleanupOptions } | { success: false; error: string } {
  const result = CleanupOptionsSchema.safeParse(raw);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error.message };
}
