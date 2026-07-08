#!/usr/bin/env tsx
import { resolve } from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import {
  auditBiomeConfig,
  auditCLIs,
  auditDocumentation,
  auditMCPs,
  auditVSCodeExtensions,
  createAuditSummary,
} from './internal/tools-audit-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
  readonly fix: boolean;
}

async function main(options: Options): Promise<void> {
  logger.step('Starting tools audit...\n');
  const rootDir = resolve(import.meta.dirname, '../..');

  const results = [
    ...auditMCPs(rootDir),
    ...auditCLIs(rootDir),
    auditVSCodeExtensions(rootDir),
    ...auditBiomeConfig(rootDir),
    auditDocumentation(rootDir),
  ];

  const summary = createAuditSummary(results);

  if (options.json) {
    logger.json(summary);
  } else {
    for (const result of summary.results) {
      const _icon = result.status === 'pass' ? '✓' : result.status === 'warn' ? '⚠' : '✗';
      if (result.details) {
        for (const _detail of result.details) {
        }
      }
    }
  }

  process.exit(summary.hasFailures ? 1 : 0);
}

const cli = createCli<Options>({
  name: 'audit-tools-registry',
  version: '2.0.0',
  description: 'Audit tools, MCPs, CLIs, and extensions',
  action: main,
  options: [{ flags: '--fix', description: 'Attempt to fix issues', defaultValue: false }],
});

if (process.argv[1]?.includes('audit-tools-registry')) {
  cli.parse(process.argv);
}
