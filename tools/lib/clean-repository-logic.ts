export interface CleanupResult {
  readonly pattern: string;
  readonly deleted: number;
  readonly error?: string;
}

export interface CleanupSummary {
  readonly results: readonly CleanupResult[];
  readonly totalDeleted: number;
}

export interface CleanupTask {
  readonly pattern: string;
  readonly description: string;
}

/** Dependency injection boundary */
export interface FsPort {
  glob(patterns: string[], cwd: string): Promise<string[]>;
  rm(path: string): Promise<void>;
  cwd(): string;
}

/** Delete files matching a pattern, returns count */
export async function deleteByPattern(
  fs: FsPort,
  pattern: string,
  dryRun: boolean,
): Promise<number> {
  const files = await fs.glob([pattern], fs.cwd());
  if (dryRun) {
    return files.length;
  }

  const results = await Promise.allSettled(files.map((f) => fs.rm(f)));
  return results.filter((r) => r.status === 'fulfilled').length;
}

/** Run all cleanup tasks */
export async function runCleanup(
  fs: FsPort,
  tasks: readonly CleanupTask[],
  dryRun: boolean,
): Promise<CleanupSummary> {
  const results: CleanupResult[] = [];
  for (const task of tasks) {
    try {
      const deleted = await deleteByPattern(fs, task.pattern, dryRun);
      results.push({ pattern: task.pattern, deleted });
    } catch (err) {
      results.push({
        pattern: task.pattern,
        deleted: 0,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }
  return { results, totalDeleted: results.reduce((sum, r) => sum + r.deleted, 0) };
}
