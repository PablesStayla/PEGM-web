#!/usr/bin/env tsx
#
!/usr/bin / env;
tsx;

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import type { FileChecker, FileReader } from './internal/k8s-logic.js';
import { compileK8sReport, runAllChecks } from './internal/k8s-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

const fileExists: FileChecker = (p) => existsSync(resolve(process.cwd(), p));
const readFile: FileReader = (p) => {
  try {
    return readFileSync(resolve(process.cwd(), p), 'utf8');
  } catch {
    return null;
  }
};

async function main(options: Options): Promise<void> {
  logger.step('Running K8s/GitOps baseline check...');

  const results = runAllChecks(fileExists, readFile);
  const report = compileK8sReport(results);

  if (options.json) {
  } else {
  }

  process.exit(report.failed > 0 ? 1 : 0);
}

const cli = createCli<Options>({
  name: 'check-k8s-gitops',
  version: '2.0.0',
  description: 'Validate K8s and GitOps infrastructure baseline',
  action: main,
});

if (process.argv[1]?.includes('check-k8s-gitops')) {
  cli.parse(process.argv);
}
