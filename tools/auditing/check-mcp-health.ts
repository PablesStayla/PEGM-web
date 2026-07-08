#!/usr/bin/env tsx
import { resolve } from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import { runAllMCPChecks } from './internal/mcp-health-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

async function main(options: Options): Promise<void> {
  logger.step('MCP Health Check - Verifying connections...\n');
  const rootDir = resolve(import.meta.dirname, '../..');
  const result = runAllMCPChecks(rootDir);

  if (!result.success) {
    logger.error(result.error);
    process.exit(1);
  }

  const summary = result.data;

  if (options.json) {
    logger.json(summary);
  } else {
    for (const r of summary.results) {
      const _icon = r.canConnect ? '✓' : '✗';
      if (r.error) {
      }
    }
    if (summary.unhealthy > 0) {
      for (const _u of summary.results.filter((r) => !r.canConnect)) {
      }
    }
  }

  process.exit(summary.allHealthy ? 0 : 1);
}

const cli = createCli<Options>({
  name: 'check-mcp-health',
  version: '2.0.0',
  description: 'Verify all configured MCPs can connect',
  action: main,
});

if (process.argv[1]?.includes('check-mcp-health')) {
  cli.parse(process.argv);
}
