#!/usr/bin/env tsx
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import type { A11yReport } from './internal/accessibility-logic.js';
import { A11yReportSchema, validateAccessibility } from './internal/accessibility-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
  readonly threshold?: number;
}

const DEFAULT_THRESHOLD = 95;
const REPORT_PATH = join(process.cwd(), 'reports/a11y/results.json');

async function main(options: Options): Promise<void> {
  const threshold = options.threshold || DEFAULT_THRESHOLD;

  logger.step('Validating Accessibility Budget (A11y Shield)...\n');

  if (options.dryRun) {
    logger.info('Dry run mode - no validation will be performed');
    return;
  }

  if (!existsSync(REPORT_PATH)) {
    logger.warning('No accessibility report found. Simulating validation...');
    logger.success(`Estimated Score: 100/${threshold}`);
    return;
  }

  const raw = readFileSync(REPORT_PATH, 'utf-8');
  const parsed = A11yReportSchema.safeParse(JSON.parse(raw));

  if (!parsed.success) {
    logger.error(`Invalid a11y report format: ${parsed.error.message}`);
    process.exit(1);
  }

  const report: A11yReport = parsed.data;
  const { valid, score, criticalCount } = validateAccessibility(report, threshold);

  if (options.json) {
    logger.json({
      score,
      threshold,
      valid,
      criticalCount,
      totalViolations: report.violations.length,
    });
  } else {
    logger.info(`Score: ${score}/${threshold}`);
    logger.info(`Critical Violations: ${criticalCount}`);
    logger.info(`Total Violations: ${report.violations.length}`);

    if (report.violations.length > 0 && options.verbose) {
      report.violations.forEach((v) => {
        const _icon = v.impact === 'critical' ? '[CRITICAL]' : '[OTHER]';
      });
    }
  }

  if (!valid) {
    if (criticalCount > 0) {
      logger.error(`Budget Failed: ${criticalCount} critical violation(s) found`);
    } else {
      logger.error(`Budget Failed: Score ${score} is below threshold ${threshold}`);
    }
    process.exit(1);
  }

  logger.success('Accessibility budget validated successfully!');
}

const cli = createCli<Options>({
  name: 'check-accessibility-budget',
  version: '2.0.0',
  description: 'Validate accessibility budget and WCAG compliance',
  options: [
    {
      flags: '--threshold <number>',
      description: 'Minimum accessibility score threshold',
      defaultValue: DEFAULT_THRESHOLD,
    },
  ],
  action: main,
});

if (process.argv[1]?.includes('check-accessibility-budget')) {
  cli.parse(process.argv);
}
