#!/usr/bin/env tsx
/**
 * Validate Environment Variables
 *
 * Validates environment variables against Zod schemas.
 * Detects production misconfigurations (test keys in prod, sandbox mode).
 *
 * @example
 * ```bash
 * # Validate default .env.local
 * pnpm env:validate
 *
 * # Validate specific env file
 * pnpm env:validate --env-file .env.production
 *
 * # JSON output for CI/CD
 * pnpm env:validate --json
 * ```
 */
import { readFile } from 'node:fs/promises';
import { detectEnvironment, parseEnvContent, validateAll } from '../lib/validate-env-logic.js';
import type { ValidationSummary } from '../lib/validate-env-types.js';
import { ValidateEnvOptionsSchema } from '../lib/validate-env-types.js';
import { createCli, logger } from '../libraries/create-cli.js';

// ============================================================================
// CLI — Imperative Shell
// ============================================================================

const cli = createCli({
  name: 'validate-env-cli',
  version: '2.0.0',
  description: 'Validate environment variables with Zod schemas',
  options: [
    {
      flags: '--env-file <path>',
      description: 'Path to .env file',
    },
  ],
  action: async (options) => {
    const parsed = ValidateEnvOptionsSchema.safeParse({
      envFile: options.envFile,
      verbose: options.verbose ?? false,
      json: options.json ?? false,
    });

    if (!parsed.success) {
      logger.error(`Invalid options: ${parsed.error.message}`);
      process.exit(1);
    }

    const opts = parsed.data;
    const envFile = opts.envFile ?? '.env.local';
    const environment = detectEnvironment(envFile);

    logger.step(`Loading ${envFile}...`);

    let env: Record<string, string>;
    try {
      const content = await readFile(envFile, 'utf-8');
      env = parseEnvContent(content);
    } catch {
      logger.error(`Failed to load ${envFile}`);
      process.exit(1);
    }

    const summary = validateAll(env, environment);
    displayResults(summary, opts);

    if (summary.failed > 0) {
      logger.error('Environment validation failed');
      process.exit(1);
    }

    logger.success('Environment validation passed');
    logEnvSummary(env);
    process.exit(0);
  },
});

function displayResults(
  summary: ValidationSummary,
  opts: { json: boolean; verbose: boolean },
): void {
  if (opts.json) {
    logger.json(summary);
    return;
  }

  for (const result of summary.results) {
    if (result.valid) {
      logger.success(result.variable);
    } else {
      logger.error(result.variable);
      if (result.error) {
        logger.error(`  ${result.error}`);
      }
    }
  }
}

function logEnvSummary(env: Record<string, string>): void {
  const _stripeMode = env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'TEST' : 'LIVE';
  const _flowMode = env.FLOW_SANDBOX === 'true' ? 'SANDBOX' : 'PRODUCTION';
}

if (process.argv[1]?.includes('validate-env-cli')) {
  cli.parse(process.argv);
}
