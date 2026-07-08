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

const DEFAULT_COVERAGE_FILE = resolve(process.cwd(), 'coverage/core-domain/coverage-final.json');

const TARGETS: readonly CoverageTarget[] = [
  {
    fileSuffix: 'packages/core-domain/src/application/checkout/checkout.service.ts',
    threshold: { statements: 90, functions: 100, branches: 80 },
  },
  {
    fileSuffix: 'packages/core-domain/src/application/catalog/product.service.ts',
    threshold: { statements: 90, functions: 100, branches: 70 },
  },
  {
    fileSuffix: 'packages/core-domain/src/application/cart/cart.service.ts',
    threshold: { statements: 90, functions: 100, branches: 70 },
  },
] as const;

async function main(options: Options): Promise<void> {
  logger.step('Checking critical coverage gate...\n');

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
    console.error('Critical coverage gate failed:');
    for (const f of failures) {
      console.error(`- ${f.target}: ${f.metric} ${f.actual}% < ${f.required}%`);
    }
    process.exit(1);
  }
}

const cli = createCli<Options>({
  name: 'check-coverage-critical',
  version: '2.0.0',
  description: 'Check critical coverage gate for core domain',
  action: main,
});

if (process.argv[1]?.includes('check-coverage-critical')) {
  cli.parse(process.argv);
}
