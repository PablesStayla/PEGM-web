#!/usr/bin/env tsx
/**
 * Enterprise Validation Orchestrator
 *
 * Runs all validation checks with sequential execution.
 * Stops on critical check failures.
 *
 * @example
 * ```bash
 * pnpm validate:all
 * pnpm validate:all --checks quality,security
 * pnpm validate:all --json
 * ```
 */
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import {
  buildSummary,
  filterChecks,
  runChecksSequential,
  VALIDATION_CHECKS,
} from '../lib/validate-all-logic.js';
import type { ExecPort, ValidationSummary } from '../lib/validate-all-types.js';
import { ValidateAllOptionsSchema } from '../lib/validate-all-types.js';
import { createCli, logger } from '../libraries/create-cli.js';

const execAsync = promisify(exec);

const realExec: ExecPort = {
  async exec(command: string, opts?: { maxBuffer?: number }) {
    return execAsync(command, { maxBuffer: opts?.maxBuffer });
  },
};

function displaySummary(summary: ValidationSummary): void {
  for (const r of summary.results) {
    const _icon = r.passed ? '✓' : '✗';
  }
}

const cli = createCli({
  name: 'validate-all-combined',
  version: '2.0.0',
  description: 'Run all enterprise validation checks',
  options: [{ flags: '--checks <names>', description: 'Comma-separated list of checks to run' }],
  action: async (options) => {
    const parsed = ValidateAllOptionsSchema.safeParse({
      checks: options.checks,
      report: options.report ?? false,
      verbose: options.verbose ?? false,
      json: options.json ?? false,
    });
    if (!parsed.success) {
      logger.error(parsed.error.message);
      process.exit(1);
    }

    const start = Date.now();
    logger.step('Starting enterprise validation suite...\n');

    const checks = parsed.data.checks
      ? filterChecks(
          VALIDATION_CHECKS,
          parsed.data.checks.split(',').map((s) => s.trim()),
        )
      : VALIDATION_CHECKS;

    const results = await runChecksSequential(realExec, checks);
    const summary = buildSummary(results, start);

    if (parsed.data.json) {
      logger.json(summary);
    } else {
      displaySummary(summary);
    }

    if (summary.criticalFailures > 0 || summary.failed > 0) {
      process.exit(1);
    }
    logger.success('\nAll validation checks passed!');
    process.exit(0);
  },
});

if (process.argv[1]?.includes('validate-all-combined')) {
  cli.parse(process.argv);
}
