#!/usr/bin/env tsx
/**
 * Vercel Deployment Stages
 *
 * Individual stage functions for deployment pipeline.
 *
 * @example
 * ```bash
 * pnpm deploy:stages
 * pnpm deploy:stages --skip-tests
 * pnpm deploy:stages --json
 * ```
 */
import { execSync } from 'node:child_process';
import { runPipeline } from '../lib/deploy-stages-logic.js';
import type { ShellPort } from '../lib/deploy-stages-types.js';
import { DeployOptionsSchema } from '../lib/deploy-stages-types.js';
import { createCli, logger } from '../libraries/create-cli.js';

/** Real shell adapter */
const realShell: ShellPort = {
  exec(command: string, opts?: { silent?: boolean }) {
    try {
      const output = execSync(command, {
        encoding: 'utf-8',
        stdio: opts?.silent ? 'pipe' : 'inherit',
      }).trim();
      return { output, success: true };
    } catch (err) {
      return { output: err instanceof Error ? err.message : 'Command failed', success: false };
    }
  },
  async fetch(url: string) {
    const response = await fetch(url);
    return { status: response.status };
  },
};

const cli = createCli({
  name: 'deploy-stages-pipeline',
  version: '2.0.0',
  description: 'Run deployment pipeline stages',
  options: [{ flags: '--skip-tests', description: 'Skip test stage', defaultValue: false }],
  action: async (options) => {
    const parsed = DeployOptionsSchema.safeParse({
      verbose: options.verbose ?? false,
      json: options.json ?? false,
      skipTests: options.skipTests ?? false,
    });
    if (!parsed.success) {
      logger.error(parsed.error.message);
      process.exit(1);
    }

    logger.step('Starting deployment pipeline...');
    const stages = await runPipeline(realShell, parsed.data.skipTests);

    for (const stage of stages) {
      if (stage.success) {
        logger.success(stage.message);
      } else {
        logger.error(stage.error);
      }
    }

    const failed = stages.filter((s) => !s.success);
    if (parsed.data.json) {
      logger.json({ stages, failed: failed.length });
    }

    if (failed.length > 0) {
      logger.error('Pipeline failed');
      process.exit(1);
    }

    logger.success('Pipeline passed');
    process.exit(0);
  },
});

if (process.argv[1]?.includes('deploy-stages-pipeline')) {
  cli.parse(process.argv);
}
