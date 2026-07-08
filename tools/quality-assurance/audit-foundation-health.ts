#!/usr/bin/env tsx
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import { compileFoundationResults } from './internal/foundation-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

async function main(options: Options): Promise<void> {
  logger.step('Validating Project Files & Documentation...\n');

  if (options.dryRun) {
    logger.info('Dry run mode - no validation will be performed');
    return;
  }

  const cwd = process.cwd();
  const results = compileFoundationResults(
    (p) => existsSync(resolve(cwd, p)),
    () => {
      const readmePath = resolve(cwd, 'README.md');
      if (!existsSync(readmePath)) {
        return null;
      }
      return readFileSync(readmePath, 'utf8');
    },
  );

  if (options.json) {
    logger.json(results);
  } else {
  }

  const errors = results.filter((r) => r.severity === 'error');
  if (errors.length > 0) {
    process.exit(1);
  }
}

const cli = createCli<Options>({
  name: 'audit-foundation-health',
  version: '2.0.0',
  description: 'Validate project files and documentation against enterprise standards',
  action: main,
});

if (process.argv[1]?.includes('audit-foundation-health')) {
  cli.parse(process.argv);
}
