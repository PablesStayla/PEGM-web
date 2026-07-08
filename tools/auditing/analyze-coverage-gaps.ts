#!/usr/bin/env tsx
import { resolve } from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import { analyzeDirectory, createCoverageSummary } from './internal/coverage-analyzer-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

async function main(options: Options): Promise<void> {
  logger.step('Analyzing test coverage...\n');
  const rootDir = resolve(import.meta.dirname, '../..');

  const gaps = [
    ...analyzeDirectory(resolve(rootDir, 'packages/core-domain/src'), 'core-domain', rootDir),
    ...analyzeDirectory(resolve(rootDir, 'packages/auth/src'), 'auth', rootDir),
    ...analyzeDirectory(resolve(rootDir, 'apps/web/src/lib'), 'web/lib', rootDir),
  ];

  const summary = createCoverageSummary(gaps);

  if (options.json) {
    logger.json(summary);
  } else {
    logger.error(`CRITICAL: ${summary.critical} files`);
    for (const _g of summary.gaps.filter((g) => g.priority === 'critical').slice(0, 10)) {
    }
    logger.warning(`HIGH: ${summary.high} files`);
    logger.info(`MEDIUM: ${summary.medium} | LOW: ${summary.low}`);
  }

  process.exit(summary.critical > 0 ? 1 : 0);
}

const cli = createCli<Options>({
  name: 'analyze-coverage-gaps',
  version: '2.0.0',
  description: 'Identify files without tests in the project',
  action: main,
});

if (process.argv[1]?.includes('analyze-coverage-gaps')) {
  cli.parse(process.argv);
}
