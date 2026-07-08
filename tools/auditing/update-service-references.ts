#!/usr/bin/env tsx
import { glob } from 'glob';
import { createCli, logger } from '../libraries/create-cli.js';
import { processFileList } from './internal/service-updater-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

async function main(options: Options): Promise<void> {
  logger.step('Auditing service references...\n');

  const patterns = ['packages/**/*.ts', 'apps/**/*.ts', 'infra/**/*.ts'];
  const allFiles: string[] = [];

  for (const pattern of patterns) {
    const files = glob.sync(pattern, { cwd: process.cwd() });
    allFiles.push(...files);
  }

  const summary = processFileList(allFiles, options.dryRun);

  if (options.json) {
    logger.json(summary);
  } else {
    for (const r of summary.results) {
      if (r.changed) {
        logger.success(`Updated: ${r.file}`);
      }
      if (r.error) {
        logger.error(`Error in ${r.file}: ${r.error}`);
      }
    }
  }

  process.exit(summary.errors > 0 ? 1 : 0);
}

const cli = createCli<Options>({
  name: 'update-service-references',
  version: '2.0.0',
  description: 'Update AuditService references to new API',
  action: main,
});

if (process.argv[1]?.includes('update-service-references')) {
  cli.parse(process.argv);
}
