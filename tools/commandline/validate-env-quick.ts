#!/usr/bin/env tsx
/**
 * Environment Validation (Legacy CLI)
 *
 * Validates environment variables from a specified .env file.
 * Uses the centralized validation logic from /tools/lib/.
 *
 * @example
 * ```bash
 * pnpm env:validate local
 * pnpm env:validate production
 * ```
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnvContent, validateAll } from '../lib/validate-env-logic.js';

function main(): void {
  const environment = process.argv[2] || 'local';
  const envFile = `.env.${environment}`;
  const envPath = resolve(process.cwd(), envFile);

  let env: Record<string, string>;
  try {
    const content = readFileSync(envPath, 'utf-8');
    env = parseEnvContent(content);
  } catch (error) {
    console.error(`Failed to load ${envFile}: ${(error as Error).message}`);
    process.exit(1);
  }

  const { results, passed, failed } = validateAll(env, environment);

  for (const r of results) {
    if (r.valid) {
    } else {
    }
  }

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main();
