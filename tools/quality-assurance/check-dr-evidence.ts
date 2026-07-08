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

const REPORT_PATH = 'docs/reports/DR_DRILL_EVIDENCE_APR_2026.md';

function runDrDrillEvidenceChecks(): QaCheckResult[] {
  return [
    checkFileExists('docs/operations/runbooks/DISASTER_RECOVERY_DRILL.md', fileExists),
    checkFileExists('docs/operations/runbooks/ROLLBACK_PLAYBOOK.md', fileExists),
    checkFileExists(REPORT_PATH, fileExists),
    checkFileContains(REPORT_PATH, 'RTO observado', 'dr:evidence-rto', fileExists, readContent),
    checkFileContains(REPORT_PATH, 'RPO observado', 'dr:evidence-rpo', fileExists, readContent),
    checkFileContains(
      REPORT_PATH,
      'Resultado del check: PASS',
      'dr:evidence-pass',
      fileExists,
      readContent,
    ),
  ];
}

async function main(options: Options): Promise<void> {
  const results = runDrDrillEvidenceChecks();
  const report = compileQaReport(results);

  if (options.json) {
  } else {
  }

  process.exit(report.failed > 0 ? 1 : 0);
}

const cli = createCli<Options>({
  name: 'check-dr-evidence',
  version: '2.0.0',
  description: 'Validate DR drill evidence readiness',
  action: main,
});

if (process.argv[1]?.includes('check-dr-evidence')) {
  cli.parse(process.argv);
}
