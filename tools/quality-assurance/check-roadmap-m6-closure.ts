#!/usr/bin/env tsx
#
!/usr/bin / env;
tsx;

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createCli } from '../libraries/create-cli.js';
import type { FileExistenceChecker, QaCheckResult } from './check-qa-gates.js';
import { checkFileExists, compileQaReport } from './check-qa-gates.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

const fileExists: FileExistenceChecker = (p) => existsSync(resolve(process.cwd(), p));

function checkPackageScript(scriptName: string): QaCheckResult {
  const packageJsonPath = resolve(process.cwd(), 'package.json');
  if (!existsSync(packageJsonPath)) {
    return { name: `script:${scriptName}`, passed: false, detail: 'package.json missing' };
  }
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      scripts?: Record<string, string>;
    };
    const ok = Boolean(packageJson.scripts?.[scriptName]);
    return {
      name: `script:${scriptName}`,
      passed: ok,
      detail: ok ? 'configured' : 'not configured',
    };
  } catch {
    return { name: `script:${scriptName}`, passed: false, detail: 'invalid package.json' };
  }
}

function runM6Checks(): QaCheckResult[] {
  return [
    checkFileExists('docs/operations/BUNDLE_REDUCTION_PLAN_M2.md', fileExists),
    checkFileExists('apps/web/src/lib/contracts/payment-provider-contracts.ts', fileExists),
    checkFileExists('docs/operations/SLO_SLI_TARGETS_2026.md', fileExists),
    checkFileExists('config/stryker.critical.config.json', fileExists),
    checkFileExists('tests/load/k6/spike-test.js', fileExists),
    checkFileExists('docs/operations/PENTEST_FINAL_M6.md', fileExists),
    checkPackageScript('test:e2e:critical'),
    checkPackageScript('analyze:bundle:web'),
    checkPackageScript('test:mutation:critical'),
    checkPackageScript('load:spike'),
    checkPackageScript('audit:closure:m6'),
  ];
}

async function main(options: Options): Promise<void> {
  const results = runM6Checks();
  const report = compileQaReport(results);

  if (options.json) {
  } else {
  }

  process.exit(report.failed > 0 ? 1 : 0);
}

const cli = createCli<Options>({
  name: 'check-roadmap-m6-closure',
  version: '2.0.0',
  description: 'Validate milestone M6 roadmap closure',
  action: main,
});

if (process.argv[1]?.includes('check-roadmap-m6-closure')) {
  cli.parse(process.argv);
}
