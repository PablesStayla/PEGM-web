#!/usr/bin/env tsx
import { existsSync, readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import type { PackageJson } from '../libraries/types.js';
import type { AuditResult } from './internal/audit-packages-logic.js';
import { compileAuditResult, compileAuditSummary } from './internal/audit-packages-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

const PACKAGES_DIR = resolve('./packages');

function readPackageJson(dir: string): PackageJson | null {
  const pkgPath = join(dir, 'package.json');
  if (!existsSync(pkgPath)) {
    return null;
  }
  const content = readFileSync(pkgPath, 'utf-8');
  return JSON.parse(content) as PackageJson;
}

async function main(options: Options): Promise<void> {
  logger.step('Starting package audit...\n');

  if (options.dryRun) {
    logger.info('Dry run mode - no audit will be performed');
    return;
  }

  const dirs = await readdir(PACKAGES_DIR);
  const results: AuditResult[] = [];

  for (const dir of dirs) {
    if (dir.startsWith('.')) {
      continue;
    }

    const pkgDir = join(PACKAGES_DIR, dir);
    const pkg = readPackageJson(pkgDir);

    if (!pkg) {
      continue;
    }

    const result = compileAuditResult(pkg, pkgDir, (p) => existsSync(p));
    results.push(result);

    if (options.verbose) {
      const status = result.score >= 80 ? 'OK' : 'WARN';
      logger.info(`${status} ${result.package} - Score: ${result.score}%`);
      result.checks.forEach((check) => {
        const _icon = check.passed ? '+' : '-';
      });
    }
  }

  const summary = compileAuditSummary(results);

  if (options.json) {
    logger.json({ total: summary.total, averageScore: summary.averageScore, results });
  } else {
    logger.step(`Audited ${summary.total} packages`);
    logger.info(`Average score: ${summary.averageScore}%`);

    if (summary.belowThreshold.length > 0) {
      logger.warning(`${summary.belowThreshold.length} packages below 80% score`);
    }
  }

  if (summary.averageScore < 80) {
    process.exit(1);
  }
}

const cli = createCli<Options>({
  name: 'audit-packages-structure',
  version: '2.0.0',
  description: 'Comprehensive audit of all packages in monorepo',
  action: main,
});

if (process.argv[1]?.includes('audit-packages-structure')) {
  cli.parse(process.argv);
}
