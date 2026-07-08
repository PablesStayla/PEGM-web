#!/usr/bin/env tsx
/**
 * Vercel Production Deployment Script
 * Runs pre-deployment checks, tests, lint, build, and deploys to Vercel
 *
 * @example
 * ```bash
 * pnpm deploy:vercel
 * pnpm deploy:vercel --dry-run
 * ```
 */

import { createCli, logger } from '../libraries/create-cli.js';
import {
  checkBranch,
  checkGitStatus,
  createReleaseTag,
  deployToVercel,
  runBuild,
  runLint,
  runSecurityAudit,
  runTests,
  runTypeCheck,
  type StageResult,
} from './deploy-stages-pipeline.js';

/**
 * CLI options
 */
interface Options {
  readonly dryRun: boolean;
  readonly verbose: boolean;
  readonly json: boolean;
}

/**
 * Deployment stage definition
 */
interface Stage {
  readonly name: string;
  readonly fn: () => Promise<StageResult>;
}

/**
 * Main deployment orchestration
 */
async function main(_options: Options): Promise<void> {
  const SITE_URL = 'https://pranakaia-store.vercel.app';
  const stages: Stage[] = [
    { name: 'deploy-vercel-production', fn: checkBranch },
    { name: 'Git status', fn: checkGitStatus },
    { name: 'Tests', fn: runTests },
    { name: 'Lint', fn: runLint },
    { name: 'Type check', fn: runTypeCheck },
    { name: 'Build', fn: runBuild },
    { name: 'Security audit', fn: runSecurityAudit },
    { name: 'Deploy', fn: deployToVercel },
    { name: 'Create tag', fn: createReleaseTag },
  ];

  logger.step('Starting Vercel Production Deployment...');

  for (const stage of stages) {
    logger.step(`Running ${stage.name}...`);

    const result = await stage.fn();

    if (!result.success) {
      logger.error(`${stage.name} failed: ${result.error}`);
      process.exit(1);
    }

    logger.success(`${stage.name} passed`);
  }

  logger.success('Deployment successful!');
  logger.info(`Site URL: ${SITE_URL}`);

  process.exit(0);
}

/**
 * CLI entry point
 */
const cli = createCli<Options>({
  name: 'deploy-vercel',
  version: '2.0.0',
  description: 'Deploy to Vercel production',
  action: main,
});

if (process.argv[1]?.includes('deploy-vercel-production')) {
  cli.parse(process.argv);
}
