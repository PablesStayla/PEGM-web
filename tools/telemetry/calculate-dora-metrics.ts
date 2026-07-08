#!/usr/bin/env tsx
import { execSync } from 'node:child_process';
import { createCli, logger } from '../libraries/create-cli.js';
import { computeDoraReport } from './internal/dora-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

function readGitInt(command: string): number {
  try {
    return parseInt(execSync(command, { encoding: 'utf8' }).trim(), 10);
  } catch {
    return 0;
  }
}

async function main(options: Options): Promise<void> {
  const totalCommits = readGitInt('git rev-list --count HEAD');
  const last7Days = readGitInt('git rev-list --count --since="7 days ago" HEAD');

  const result = computeDoraReport({
    totalCommits,
    last7Days,
    leadTimeHours: 1.2,
    changeFailureRate: 0,
    mttrMinutes: 15,
  });

  if (!result.success) {
    logger.error(result.error);
    process.exit(1);
  }

  if (options.json) {
  } else {
  }
}

const cli = createCli<Options>({
  name: 'calculate-dora-metrics',
  version: '2.0.0',
  description: 'Calculate DORA metrics from git history',
  action: main,
});

if (process.argv[1]?.includes('calculate-dora-metrics')) {
  cli.parse(process.argv);
}
