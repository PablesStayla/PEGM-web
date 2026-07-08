#!/usr/bin/env tsx
/**
 * Clean Build Artifacts
 *
 * Safely removes build artifacts, cache directories, and temporary files
 * from the monorepo. Uses intelligent detection to avoid deleting
 * important files.
 *
 * @example
 * ```bash
 * # Dry run (show what would be deleted)
 * pnpm tools:ops:cleanup --dry-run
 *
 * # Clean all safe artifacts
 * pnpm tools:ops:cleanup
 *
 * # Clean specific targets only
 * pnpm tools:ops:cleanup --targets build,cache
 *
 * # Exclude patterns
 * pnpm tools:ops:cleanup --exclude .turbo
 *
 * # JSON output for CI/CD
 * pnpm tools:ops:cleanup --json
 * ```
 */
import { readdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import {
  buildReport,
  CLEANUP_TARGETS,
  filterTargets,
  formatBytes,
  scanAndClean,
} from '../lib/clean-artifacts-logic.js';
import type { FileSystemPort } from '../lib/clean-artifacts-types.js';
import { createCli, logger } from '../libraries/create-cli.js';

// ============================================================================
// Real FileSystem adapter (side effects)
// ============================================================================

const realFs: FileSystemPort = {
  async readDir(path: string) {
    const entries = await readdir(path, { withFileTypes: true });
    return entries.map((e) => e.name);
  },
  async isDirectory(path: string) {
    try {
      return (await stat(path)).isDirectory();
    } catch {
      return false;
    }
  },
  async getSize(path: string) {
    const s = await stat(path);
    if (s.isDirectory()) {
      const entries = await readdir(path);
      const sizes = await Promise.all(entries.map((e) => realFs.getSize(join(path, e))));
      return sizes.reduce((sum, sz) => sum + sz, 0);
    }
    return s.size;
  },
  async remove(path: string) {
    await rm(path, { recursive: true, force: true });
  },
};

// ============================================================================
// CLI — Imperative Shell
// ============================================================================

const cli = createCli({
  name: 'clean-artifacts-build',
  version: '2.0.0',
  description: 'Clean build artifacts and temporary files from monorepo',
  options: [
    {
      flags: '--targets <list>',
      description:
        'Comma-separated target types: build,dependencies,cache,coverage,typescript,logs,temp',
    },
    {
      flags: '--exclude <list>',
      description: 'Comma-separated patterns to exclude',
    },
  ],
  action: async (options) => {
    const validated = {
      verbose: options.verbose ?? false,
      json: options.json ?? false,
      dryRun: options.dryRun ?? false,
      targets: options.targets,
      exclude: options.exclude,
      rootPath: process.cwd(),
    };

    if (options.dryRun) {
      logger.info('Dry run mode — no files will be deleted');
    }

    const targets = filterTargets(
      CLEANUP_TARGETS,
      validated.targets?.split(',').map((s: string) => s.trim()),
      validated.exclude?.split(',').map((s: string) => s.trim()),
    );

    logger.info(`Found ${targets.length} cleanup target(s)`);

    const allResults = [];
    for (const target of targets) {
      if (options.verbose) {
        logger.step(`Cleaning: ${target.name}`);
      }
      const results = await scanAndClean(
        realFs,
        validated.rootPath,
        target.patterns,
        validated.dryRun,
        true,
      );
      allResults.push(...results);
    }

    const report = buildReport(allResults);

    if (options.json) {
      logger.json(report);
    } else {
      logger.step(`Cleaned ${report.cleaned} artifact(s)`);
      logger.info(`Total size: ${formatBytes(report.totalSize)}`);
      for (const r of report.results.filter((r) => !r.success)) {
        logger.error(` ${r.path}: ${r.error}`);
      }
      if (options.dryRun) {
        logger.info('Run without --dry-run to actually delete files');
      }
    }

    process.exit(0);
  },
});

if (process.argv[1]?.includes('clean-artifacts-build')) {
  cli.parse(process.argv);
}
