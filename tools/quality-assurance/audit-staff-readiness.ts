#!/usr/bin/env tsx
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import type { ArchFinding } from './internal/architecture-logic.js';
import {
  analyzeFile,
  DEFAULT_GIGANTISM_CONFIG,
  FORBIDDEN_IMPORT_RULES,
} from './internal/architecture-logic.js';
import { walkDir as getAllFiles } from './internal/audit-utils.js';
import type { StaffAuditStats } from './internal/staff-audit-logic.js';
import {
  determineExitCode,
  resolveFirstExisting,
  SCAN_ROOTS,
  SUB_AUDIT_SCRIPTS,
} from './internal/staff-audit-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
  readonly strict: boolean;
  readonly report: boolean;
}

async function main(options: Options): Promise<void> {
  logger.step('Starting Staff Master Audit...\n');

  if (options.dryRun) {
    logger.info('Dry run mode - no audit will be performed');
    return;
  }

  const stats: StaffAuditStats = { totalFiles: 0, findings: [] };
  const allFiles: string[] = [];
  const cwd = process.cwd();

  for (const root of SCAN_ROOTS) {
    const rootPath = path.join(cwd, root);
    if (fs.existsSync(rootPath)) {
      allFiles.push(...getAllFiles(rootPath));
    }
  }
  stats.totalFiles = allFiles.length;

  for (const file of allFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const findings = analyzeFile(content, file, DEFAULT_GIGANTISM_CONFIG, FORBIDDEN_IMPORT_RULES);
      (stats.findings as ArchFinding[]).push(...findings);
    } catch {}
  }

  const subAuditFailures: string[] = [];
  for (const subAudit of SUB_AUDIT_SCRIPTS) {
    const resolved = resolveFirstExisting(subAudit.candidates, (p) =>
      fs.existsSync(path.join(cwd, p)),
    );
    if (!resolved) {
      const failure = `${subAudit.name}: script not found in ${subAudit.candidates.join(', ')}`;
      logger.error(failure);
      subAuditFailures.push(failure);
      continue;
    }
    try {
      logger.info(`Running ${subAudit.name}: ${resolved}`);
      execSync(`pnpm exec tsx ${resolved}`, { stdio: 'inherit' });
    } catch {
      const failure = `${subAudit.name}: failed executing ${resolved}`;
      logger.error(failure);
      subAuditFailures.push(failure);
    }
  }

  if (options.json) {
    logger.json({ stats, subAuditFailures });
  } else {
  }

  if (options.report) {
    const reportPath = path.join(cwd, 'docs/reports/STAFF_AUDIT_REPORT.md');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    const details = stats.findings
      .map((f) => `- **${f.type}** [${f.filePath}:${f.line}]: ${f.message}`)
      .join('\n');
    fs.writeFileSync(
      reportPath,
      `# Staff Audit Report\n\nFiles: ${stats.totalFiles}\nFindings: ${stats.findings.length}\n\n${details || '- No findings'}`,
      'utf8',
    );
  }

  const exitCode = determineExitCode(stats, subAuditFailures, options.strict);
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}

const cli = createCli<Options>({
  name: 'audit-staff-readiness',
  version: '2.0.0',
  description: 'Master staff audit orchestrator',
  action: main,
  options: [
    {
      flags: '--strict',
      description: 'Fail-fast on any audit findings or failures',
      defaultValue: false,
    },
    {
      flags: '--report',
      description: 'Write Markdown report to docs/reports/',
      defaultValue: false,
    },
  ],
});

if (
  process.argv[1]?.includes('staff-audit') ||
  process.argv[1]?.includes('audit-staff-readiness')
) {
  cli.parse(process.argv);
}
