#!/usr/bin/env tsx
/**
 * Clean Repository
 *
 * Removes build artifacts, test outputs, and temporary files.
 *
 * @example
 * ```bash
 * pnpm clean:repo
 * pnpm clean:repo --dry-run
 * pnpm clean:repo --verbose
 * ```
 */
import { rm } from 'node:fs/promises';
import { glob } from 'tinyglobby';
import type { FsPort } from '../lib/clean-repository-logic.js';
import { runCleanup } from '../lib/clean-repository-logic.js';
import { createCli, logger } from '../libraries/create-cli.js';
import { CLEANUP_TASKS } from './define-cleanup-tasks.js';

const realFs: FsPort = {
  glob: (patterns, cwd) => glob(patterns, { cwd }),
  rm: (path) => rm(path, { force: true }),
  cwd: () => process.cwd(),
};

const cli = createCli({
  name: 'clean-repository-files',
  version: '2.0.0',
  description: 'Clean repository build artifacts and temp files',
  action: async (options) => {
    if (options.dryRun) {
      logger.warning('DRY RUN — no files will be deleted');
    }
    logger.step('Starting repository cleanup...');

    const summary = await runCleanup(realFs, CLEANUP_TASKS, options.dryRun);

    if (options.json) {
      logger.json(summary);
    } else {
      for (const r of summary.results) {
        if (r.deleted > 0) {
          logger.success(`${r.pattern}: ${r.deleted} items`);
        } else if (r.error) {
          logger.error(`${r.pattern}: ${r.error}`);
        }
      }
      logger.step(`Total deleted: ${summary.totalDeleted} items`);
    }

    if (summary.results.some((r) => r.error)) {
      process.exit(1);
    }
    process.exit(0);
  },
});

if (process.argv[1]?.includes('clean-repository-files')) {
  cli.parse(process.argv);
}
