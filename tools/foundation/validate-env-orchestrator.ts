#!/usr/bin/env tsx
import { readFile } from 'node:fs/promises';
/**
 * Environment Validator - Orchestrator
 *
 * Validates environment variables against schema definitions.
 * Now imports from centralized /tools/lib/.
 *
 * @example
 * ```bash
 * pnpm env:validate
 * pnpm env:validate --env-file .env.production
 * pnpm env:validate --verbose --json
 * ```
 */
import { join } from 'node:path';
import { parseEnvFile, validateEnvironment } from '../lib/env-validator-logic.js';
import { ALL_ENV_SCHEMAS, EnvValidatorOptionsSchema } from '../lib/env-validator-types.js';
import { createCli, logger } from '../libraries/create-cli.js';

async function loadEnv(envPath: string): Promise<Record<string, string | undefined>> {
  try {
    const content = await readFile(envPath, 'utf-8');
    return parseEnvFile(content);
  } catch {
    return process.env as Record<string, string | undefined>;
  }
}

const cli = createCli({
  name: 'validate-env-orchestrator',
  version: '2.0.0',
  description: 'Validate environment variables against schema',
  options: [{ flags: '--env-file <path>', description: 'Path to .env file' }],
  action: async (options) => {
    const parsed = EnvValidatorOptionsSchema.safeParse({
      envFile: options.envFile,
      verbose: options.verbose ?? false,
      json: options.json ?? false,
    });
    if (!parsed.success) {
      logger.error(parsed.error.message);
      process.exit(1);
    }

    const envPath = parsed.data.envFile || join(process.cwd(), '.env');
    logger.step('Loading environment...');

    const env = await loadEnv(envPath);
    logger.info(`Environment: ${env.NODE_ENV || 'not set'}`);

    const result = validateEnvironment(ALL_ENV_SCHEMAS, env);
    if (!result.success) {
      logger.error(result.error);
      process.exit(1);
    }

    const summary = result.data;

    if (parsed.data.json) {
      logger.json(summary);
    } else {
      for (const r of summary.results) {
        if (r.valid) {
          logger.success(r.variable);
        } else {
          logger.error(r.variable);
          r.errors.forEach((e) => logger.error(`  ${e}`));
        }
        if (parsed.data.verbose) {
          r.warnings.forEach((w) => logger.warning(`  ${w}`));
        }
      }
    }

    if (summary.failed > 0) {
      logger.error('Validation failed');
      process.exit(1);
    }
    logger.success('Environment validation passed');
    process.exit(0);
  },
});

if (process.argv[1]?.includes('validate-env-orchestrator')) {
  cli.parse(process.argv);
}
