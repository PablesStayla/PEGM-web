#!/usr/bin/env tsx
#
!/usr/bin / env;
tsx;

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createCli } from '../libraries/create-cli.js';
import type { QaCheckResult } from './check-qa-gates.js';
import { checkContentContains, compileQaReport } from './check-qa-gates.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

function runSecurityAutomationChecks(): QaCheckResult[] {
  const workflowPath = resolve(process.cwd(), '.github/workflows/security.yml');
  if (!existsSync(workflowPath)) {
    return [{ name: 'check-security-automation', passed: false, detail: 'file missing' }];
  }

  const content = readFileSync(workflowPath, 'utf8');
  return [
    checkContentContains(content, 'gitleaks', 'security:gitleaks-job'),
    checkContentContains(content, 'codeql', 'security:codeql-job'),
    checkContentContains(content, 'dependency-review', 'security:dependency-review-job'),
    checkContentContains(content, 'trivy-fs', 'security:trivy-fs-job'),
    checkContentContains(content, 'trivy-iac', 'security:trivy-iac-job'),
    checkContentContains(content, 'aquasecurity/trivy-action', 'security:trivy-action'),
  ];
}

async function main(options: Options): Promise<void> {
  const results = runSecurityAutomationChecks();
  const report = compileQaReport(results);

  if (options.json) {
  } else {
  }

  process.exit(report.failed > 0 ? 1 : 0);
}

const cli = createCli<Options>({
  name: 'security-automation-check',
  version: '2.0.0',
  description: 'Validate security automation workflow jobs',
  action: main,
});

if (process.argv[1]?.includes('check-security-automation')) {
  cli.parse(process.argv);
}
