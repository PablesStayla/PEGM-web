#!/usr/bin/env tsx
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import type { FileExistenceChecker } from './check-qa-gates.js';
import { checkFileExists, compileQaReport } from './check-qa-gates.js';
import { checkScript, REQUIRED_DR_FILES, REQUIRED_DR_SCRIPTS } from './internal/dr-drill-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

const fileExists: FileExistenceChecker = (p) => existsSync(resolve(process.cwd(), p));

const scriptCtx = {
  existsSync,
  readFileSync: (p: string) => readFileSync(p, 'utf8'),
  cwd: resolve(process.cwd()),
};

function runDrDrillChecks() {
  return [
    ...REQUIRED_DR_FILES.map((p) => checkFileExists(p, fileExists)),
    ...REQUIRED_DR_SCRIPTS.map((s) => checkScript(s, scriptCtx)),
  ];
}

async function main(options: Options): Promise<void> {
  logger.step('Starting DR drill readiness check...\n');

  if (options.dryRun) {
    logger.info('Dry run mode - no checks will be performed');
    process.exit(0);
  }

  const results = runDrDrillChecks();
  const report = compileQaReport(results);

  if (options.json) {
  } else {
  }

  process.exit(report.failed > 0 ? 1 : 0);
}

const cli = createCli<Options>({
  name: 'check-dr-readiness',
  version: '2.0.0',
  description: 'Check disaster recovery drill readiness',
  action: main,
});

if (process.argv[1]?.includes('check-dr-readiness')) {
  cli.parse(process.argv);
}
