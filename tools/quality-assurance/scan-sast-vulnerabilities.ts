#!/usr/bin/env tsx
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import { walkDir as getAllFiles } from './internal/audit-utils.js';
import { SAST_PATTERNS, scanContent } from './internal/sast-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

const SCAN_DIRS = ['apps', 'packages'];

async function main(options: Options): Promise<void> {
  logger.step('Running SAST scan...');

  const findings = [];

  for (const dir of SCAN_DIRS) {
    const rootPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(rootPath)) {
      continue;
    }

    const files = getAllFiles(rootPath).filter((f) => /\.(ts|tsx|js|jsx)$/.test(f));

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      findings.push(...scanContent(content, file, SAST_PATTERNS));
    }
  }

  if (options.json) {
  } else {
  }

  const criticals = findings.filter((f) => f.severity === 'critical').length;
  process.exit(criticals > 0 ? 1 : 0);
}

const cli = createCli<Options>({
  name: 'scan-sast-vulnerabilities',
  version: '2.0.0',
  description: 'Static analysis security testing for source code',
  action: main,
});

if (process.argv[1]?.includes('scan-sast-vulnerabilities')) {
  cli.parse(process.argv);
}
