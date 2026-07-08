#!/usr/bin/env tsx
import { execSync } from 'node:child_process';
import { createCli, logger } from '../libraries/create-cli.js';
import { formatAdvisory, parseAuditReport } from './internal/audit-dependency-logic.js';
import { TEMPORARY_ALLOWLIST } from './internal/audit-dependency-types.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

async function main(options: Options): Promise<void> {
  let output = '';

  try {
    output = execSync('pnpm audit --json', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error: unknown) {
    const e = error as { stdout?: string; stderr?: string; message?: string };
    output = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    if (!output) {
      logger.error(e.message ?? 'pnpm audit failed without output');
      process.exit(1);
    }
  }

  const result = parseAuditReport(output);
  if (!result.success) {
    logger.error(result.error);
    process.exit(1);
  }

  const audit = result.data;

  if (options.json) {
    logger.json(audit);
  } else {
    if (audit.tolerated.length > 0) {
      for (const advisory of audit.tolerated) {
        const _reason = TEMPORARY_ALLOWLIST.get(advisory.id) ?? 'No reason provided';
      }
    }

    if (audit.blocking.length > 0) {
      console.error('Blocking advisories detected:');
      for (const advisory of audit.blocking) {
        console.error(formatAdvisory(advisory));
      }
      process.exit(1);
    }

    logger.success('Security audit passed');
  }

  process.exit(0);
}

const cli = createCli<Options>({
  name: 'audit-dependencies',
  version: '2.0.0',
  description: 'Run pnpm audit and classify advisories',
  action: main,
});

if (process.argv[1]?.includes('audit-dependencies')) {
  cli.parse(process.argv);
}
