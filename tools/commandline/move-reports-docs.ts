#!/usr/bin/env tsx
/**
 * Move Reports
 *
 * Automatically moves generated .md report files from root to docs/reports/.
 *
 * @example
 * ```bash
 * pnpm move:reports
 * pnpm move:reports --dry-run
 * ```
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { MovePort } from '../lib/move-reports-logic.js';
import { moveReports } from '../lib/move-reports-logic.js';
import { createCli, logger } from '../libraries/create-cli.js';
import { getMatchingFiles, TARGET_DIR } from './move-reports-batch.js';

const realPort: MovePort = {
  stat: (p) => {
    const s = fs.statSync(p);
    return { isFile: s.isFile() };
  },
  exists: (p) => fs.existsSync(p),
  rename: (old, nw) => fs.renameSync(old, nw),
  mkdir: (p, opts) => fs.mkdirSync(p, opts),
  getMatchingFiles: (root) => getMatchingFiles(root),
  cwd: () => process.cwd(),
};

const cli = createCli({
  name: 'move-reports-docs',
  version: '2.0.0',
  description: 'Move report files to docs/reports',
  action: async (options) => {
    const rootDir = realPort.cwd();
    const targetDir = path.join(rootDir, TARGET_DIR);

    logger.step('Auto-moving report files...');
    if (!fs.existsSync(targetDir)) {
      realPort.mkdir(targetDir, { recursive: true });
      logger.info(`Created directory: ${TARGET_DIR}`);
    }

    if (options.dryRun) {
      const files = getMatchingFiles(rootDir);
      logger.warning(`DRY RUN — Would move ${files.length} files`);
      files.forEach((f) => logger.info(`  ${f}`));
      return;
    }

    const results = moveReports(realPort, rootDir, targetDir);

    if (options.json) {
      logger.json({ results });
    } else {
      const ok = results.filter((r) => r.success).length;
      const fail = results.filter((r) => !r.success).length;
      logger.info(`Moved: ${ok} | Failed: ${fail}`);
      for (const r of results.filter((r) => !r.success)) {
        logger.error(`  ${r.file}: ${r.error}`);
      }
    }

    if (results.some((r) => !r.success)) {
      process.exit(1);
    }
    logger.success(`Report files moved to ${TARGET_DIR}/`);
    process.exit(0);
  },
});

if (process.argv[1]?.includes('move-reports-docs')) {
  cli.parse(process.argv);
}
