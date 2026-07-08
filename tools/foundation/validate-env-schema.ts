#!/usr/bin/env tsx
/**
 * Environment Validator
 *
 * Validates environment variables against schema definitions.
 * Ensures all required variables are present and properly formatted.
 *
 * @example
 * ```bash
 * # Validate current environment
 * pnpm env:validate
 *
 * # Validate with specific env file
 * pnpm env:validate --env-file .env.production
 *
 * # Verbose output with warnings
 * pnpm env:validate --verbose
 *
 * # JSON output for CI/CD
 * pnpm env:validate --json
 * ```
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseEnvFile, validateEnvironment } from '../lib/env-validator-logic.js';
import type { EnvFilePort, ValidationSummary } from '../lib/env-validator-types.js';
import { ALL_ENV_SCHEMAS, EnvValidatorOptionsSchema } from '../lib/env-validator-types.js';
import { createCli, logger } from '../libraries/create-cli.js';

// ============================================================================
// Real EnvFile adapter (side effects)
// ============================================================================

const realEnvFile: EnvFilePort = {
  async readFile(path: string) {
    return readFile(path, 'utf-8');
  },
  cwd() {
    return process.cwd();
  },
};

// ============================================================================
// CLI — Imperative Shell
// ============================================================================

const cli = createCli({
  name: 'validate-env-schema',
  version: '2.0.0',
  description: 'Validate environment variables against schema',
  options: [
    {
      flags: '--env-file <path>',
      description: 'Path to .env file (default: .env)',
    },
  ],
  action: async (options) => {
    const parsed = EnvValidatorOptionsSchema.safeParse({
      envFile: options.envFile,
      verbose: options.verbose ?? false,
      json: options.json ?? false,
    });

    if (!parsed.success) {
      logger.error(`Invalid options: ${parsed.error.message}`);
      process.exit(1);
    }

    const opts = parsed.data;
    const envPath = opts.envFile || join(realEnvFile.cwd(), '.env');

    logger.step('Loading environment...');

    let env: Record<string, string | undefined>;
    try {
      const content = await realEnvFile.readFile(envPath);
      env = parseEnvFile(content);
    } catch {
      env = process.env as Record<string, string | undefined>;
    }

    logger.info(`Environment: ${env.NODE_ENV || 'not set'}`);

    const result = validateEnvironment(ALL_ENV_SCHEMAS, env);

    if (!result.success) {
      logger.error(result.error);
      process.exit(1);
    }

    const summary = result.data;
    displayResults(summary, opts);

    if (summary.failed > 0) {
      logger.error('Environment validation failed');
      process.exit(1);
    }

    logger.success('Environment validation passed');
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

  for (const r of summary.results) {
    if (r.valid) {
      logger.success(r.variable);
    } else {
      logger.error(r.variable);
      r.errors.forEach((e) => logger.error(`  ${e}`));
    }
    if (opts.verbose) {
      r.warnings.forEach((w) => logger.warning(`  ${w}`));
    }
  }
}

if (process.argv[1]?.includes('validate-env-schema')) {
  cli.parse(process.argv);
}
