#!/usr/bin/env tsx
#
!/usr/bin / env;
tsx;

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createCli } from '../libraries/create-cli.js';
import { failure, success } from '../libraries/types.js';
import type { ContentReader, FileExistenceChecker, QaCheckResult } from './check-qa-gates.js';
import { checkFileContains, checkFileExists, compileQaReport } from './check-qa-gates.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

const fileExists: FileExistenceChecker = (p) => existsSync(resolve(process.cwd(), p));
const readContent: ContentReader = (p) => {
  try {
    return success(readFileSync(resolve(process.cwd(), p), 'utf8'));
  } catch {
    return failure('Failed to read file');
  }
};

function runBugBountyChecks(): QaCheckResult[] {
  return [
    checkFileExists('docs/operations/BUG_BOUNTY_POLICY.md', fileExists),
    checkFileExists('docs/operations/BUG_BOUNTY_OPERATIONS.md', fileExists),
    checkFileExists('docs/reports/SECURITY_BUG_BOUNTY_MONTHLY.md', fileExists),
    checkFileExists('.github/ISSUE_TEMPLATE/security-report.yml', fileExists),
    checkFileContains(
      'SECURITY.md',
      'security@pranakaia.cl',
      'security:contact-email',
      fileExists,
      readContent,
    ),
    checkFileContains(
      'SECURITY.md',
      'BUG_BOUNTY_POLICY',
      'security:policy-link',
      fileExists,
      readContent,
    ),
    checkFileContains(
      'docs/operations/BUG_BOUNTY_OPERATIONS.md',
      'Ack: <= 48h',
      'operations:sla-ack',
      fileExists,
      readContent,
    ),
  ];
}

async function main(options: Options): Promise<void> {
  const results = runBugBountyChecks();
  const report = compileQaReport(results);

  if (options.json) {
  } else {
  }

  process.exit(report.failed > 0 ? 1 : 0);
}

const cli = createCli<Options>({
  name: 'check-bug-bounty-ops',
  version: '2.0.0',
  description: 'Validate bug bounty program operational readiness',
  action: main,
});

if (process.argv[1]?.includes('check-bug-bounty-ops')) {
  cli.parse(process.argv);
}
