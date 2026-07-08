/**
 * Environment File Parser (Legacy Re-export)
 *
 * Consolidated into /tools/lib/validate-env-logic.ts and
 * /tools/lib/env-validator-logic.ts.
 *
 * @deprecated Import parseEnvFile from '../lib/env-validator-logic.js'
 *             or parseEnvContent from '../lib/validate-env-logic.js'
 */
import { readFile } from 'node:fs/promises';
import { parseEnvFile } from '../lib/env-validator-logic.js';

export { parseEnvFile as parseEnvContent } from '../lib/env-validator-logic.js';

export type EnvFileResult =
  | { success: true; data: Record<string, string> }
  | { success: false; error: string };

/** Load and parse a .env file (backward compat) */
export async function loadEnvFile(
  envPath: string,
  fallback: Record<string, string> = {},
): Promise<EnvFileResult> {
  try {
    const content = await readFile(envPath, 'utf-8');
    const parsed = parseEnvFile(content);
    return { success: true, data: { ...fallback, ...parsed } as Record<string, string> };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to load .env file',
    };
  }
}

/** Merge multiple env sources */
export function mergeEnv(...sources: Record<string, string | undefined>[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (value !== undefined && value !== '') {
        result[key] = value;
      }
    }
  }
  return result;
}
