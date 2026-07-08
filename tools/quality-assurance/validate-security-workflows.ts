#!/usr/bin/env tsx
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import { validateWorkflows } from './internal/security-workflows-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

const SECURITY_WORKFLOW_PATH = resolve(process.cwd(), '.github/workflows/security.yml');
const CODEQL_WORKFLOW_PATH = resolve(process.cwd(), '.github/workflows/codeql.yml');

async function main(options: Options): Promise<void> {
  logger.step('Validating security workflows...\n');

  if (options.dryRun) {
    logger.info('Dry run mode - no validation will be performed');
    return;
  }

  if (!existsSync(SECURITY_WORKFLOW_PATH)) {
    logger.error(`Security workflow not found at: ${SECURITY_WORKFLOW_PATH}`);
    process.exit(1);
  }

  if (!existsSync(CODEQL_WORKFLOW_PATH)) {
    logger.error(`CodeQL workflow not found at: ${CODEQL_WORKFLOW_PATH}`);
    process.exit(1);
  }

  const securityContent = readFileSync(SECURITY_WORKFLOW_PATH, 'utf8');
  const codeqlContent = readFileSync(CODEQL_WORKFLOW_PATH, 'utf8');

  const result = validateWorkflows(securityContent, codeqlContent);

  if (options.json) {
    logger.json(result);
  } else {
  }

  if (!result.success) {
    process.exit(1);
  }
}

const cli = createCli<Options>({
  name: 'validate-security-workflows',
  version: '2.0.0',
  description: 'Validate GitHub Actions security workflows',
  action: main,
});

if (process.argv[1]?.includes('validate-security-workflows')) {
  cli.parse(process.argv);
}
