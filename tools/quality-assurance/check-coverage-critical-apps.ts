#!/usr/bin/env tsx
#
!/usr/bin / env;
tsx;

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import type { CoverageEntry, CoverageTarget } from './internal/coverage-logic.js';
import { findCoverageEntry, runCoverageGate } from './internal/coverage-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
  readonly coverage?: string;
}

const DEFAULT_COVERAGE_FILE = resolve(process.cwd(), 'coverage/apps-web/coverage-final.json');

const TARGETS: readonly CoverageTarget[] = [
  {
    fileSuffix: 'apps/web/src/app/[locale]/actions/checkout.ts',
    threshold: { statements: 70, functions: 70, branches: 60 },
  },
  {
    fileSuffix: 'apps/web/src/app/api/chat/route.ts',
    threshold: { statements: 85, functions: 100, branches: 80 },
  },
  {
    fileSuffix: 'apps/web/src/app/api/coupons/route.ts',
    threshold: { statements: 90, functions: 100, branches: 80 },
  },
  {
    fileSuffix: 'apps/web/src/middleware/security-headers.ts',
    threshold: { statements: 100, functions: 100, branches: 100 },
  },
] as const;

async function main(options: Options): Promise<void> {
  logger.step('Checking apps critical coverage gate...\n');

  if (options.dryRun) {
    logger.info('Dry run mode - no checks will be performed');
    return;
  }

  const coverageFile = options.coverage
    ? resolve(process.cwd(), options.coverage)
    : DEFAULT_COVERAGE_FILE;

  const raw = readFileSync(coverageFile, 'utf8');
  const coverageMap = JSON.parse(raw) as Record<string, CoverageEntry>;

  for (const target of TARGETS) {
    const _entry = findCoverageEntry(coverageMap, target.fileSuffix);
  }

  const failures = runCoverageGate(coverageMap, TARGETS);

  if (failures.length > 0) {
    console.error('Apps critical coverage gate failed:');
    for (const f of failures) {
      console.error(`- ${f.target}: ${f.metric} ${f.actual}% < ${f.required}%`);
    }
    process.exit(1);
  }
}

const cli = createCli<Options>({
  name: 'check-coverage-critical-apps',
  version: '2.0.0',
  description: 'Check critical coverage gate for apps',
  action: main,
});

if (process.argv[1]?.includes('check-coverage-critical-apps')) {
  cli.parse(process.argv);
}
