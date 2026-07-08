#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import {
  applyPackageJsonUpdate,
  isPatchAvailable,
  parseDistTagsResponse,
} from './internal/lodash-upstream-logic.js';
import type { PackageJsonOverrides } from './internal/lodash-upstream-types.js';
import { MIN_PATCHED_VERSION } from './internal/lodash-upstream-types.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
  readonly apply: boolean;
}

async function fetchLatestLodashVersion(): Promise<string> {
  const response = await fetch('https://registry.npmjs.org/lodash', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to query npm registry: HTTP ${response.status}`);
  }
  const data = await response.json();
  const result = parseDistTagsResponse(data);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}

async function main(options: Options): Promise<void> {
  const latest = await fetchLatestLodashVersion();
  logger.info(`Latest lodash version published: ${latest}`);

  const patchAvailable = isPatchAvailable(latest);

  if (!patchAvailable) {
    logger.info(`No upstream patched release available yet (required >= ${MIN_PATCHED_VERSION})`);
    process.exit(0);
  }

  logger.success(`Upstream patched release detected: ${latest}`);

  if (!options.apply) {
    logger.info('Check mode only. No changes applied.');
    process.exit(0);
  }

  const rootDir = process.cwd();
  const rootPackageJsonPath = join(rootDir, 'package.json');
  const raw = readFileSync(rootPackageJsonPath, 'utf8');
  const pkg = JSON.parse(raw) as PackageJsonOverrides;
  const updated = applyPackageJsonUpdate(pkg, latest);
  writeFileSync(rootPackageJsonPath, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');

  logger.success('Applied lodash upstream patch changes to package overrides');
  process.exit(0);
}

const cli = createCli<Options>({
  name: 'check-lodash-upstream',
  version: '2.0.0',
  description: 'Check and apply lodash upstream patches',
  action: main,
  options: [{ flags: '--apply', description: 'Apply patch changes', defaultValue: false }],
});

if (process.argv[1]?.includes('check-lodash-upstream')) {
  cli.parse(process.argv);
}
