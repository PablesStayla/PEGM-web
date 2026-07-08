#!/usr/bin/env tsx
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import { DEFAULT_BUDGETS, validateBudgets } from './internal/budget-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

function measureBundle(appName: string): { totalSizeKB: number; firstLoadKB: number } {
  const staticDir = path.join(process.cwd(), 'apps', appName, '.next', 'static');
  if (!fs.existsSync(staticDir)) {
    return { totalSizeKB: 0, firstLoadKB: 0 };
  }

  let totalBytes = 0;
  const chunksDir = path.join(staticDir, 'chunks');
  if (fs.existsSync(chunksDir)) {
    for (const file of fs.readdirSync(chunksDir)) {
      const stat = fs.statSync(path.join(chunksDir, file));
      totalBytes += stat.size;
    }
  }

  return {
    totalSizeKB: Math.round(totalBytes / 1024),
    firstLoadKB: Math.round(totalBytes / 1024),
  };
}

async function main(options: Options): Promise<void> {
  const appSizes: Record<string, { totalSizeKB: number; firstLoadKB: number }> = {};

  for (const appName of Object.keys(DEFAULT_BUDGETS)) {
    const nextDir = path.join(process.cwd(), 'apps', appName, '.next');
    if (!fs.existsSync(nextDir)) {
      logger.warning(`No build found for ${appName}. Run 'pnpm build' first.`);
      appSizes[appName] = { totalSizeKB: 0, firstLoadKB: 0 };
      continue;
    }
    appSizes[appName] = measureBundle(appName);
  }

  const results = validateBudgets(appSizes, DEFAULT_BUDGETS);

  if (options.json) {
  } else {
  }

  const failed = results.filter((r) => !r.withinBudget).length;
  process.exit(failed > 0 ? 1 : 0);
}

const cli = createCli<Options>({
  name: 'check-bundle-budget',
  version: '2.0.0',
  description: 'Validate application bundle performance budgets',
  action: main,
});

if (process.argv[1]?.includes('check-bundle-budget')) {
  cli.parse(process.argv);
}
