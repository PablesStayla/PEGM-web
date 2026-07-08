#!/usr/bin/env tsx
/**
 * Validate Package Exports
 *
 * Validates package.json exports configuration for all packages.
 *
 * @example
 * ```bash
 * pnpm packages:exports
 * pnpm packages:exports --json
 * ```
 */
import { existsSync, readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { ExportValidationResult } from '../lib/validate-packages-exports-logic.js';
import {
  validateExportEntry,
  validatePackageFields,
  validateSecondaryExports,
} from '../lib/validate-packages-exports-logic.js';
import { createCli, logger } from '../libraries/create-cli.js';
import type { PackageJson } from '../libraries/types.js';

const cli = createCli({
  name: 'validate-packages-exports',
  version: '2.0.0',
  description: 'Validate package exports configuration',
  action: async (options) => {
    logger.step('Validating package exports...\n');
    if (options.dryRun) {
      logger.info('Dry run mode');
      return;
    }

    const packagesDir = resolve('./packages');
    const dirs = await readdir(packagesDir);
    const results: ExportValidationResult[] = [];
    const fe = (p: string) => existsSync(p);

    for (const dir of dirs) {
      if (dir.startsWith('.')) {
        continue;
      }
      const pkgDir = join(packagesDir, dir);
      const pkgPath = join(pkgDir, 'package.json');
      if (!existsSync(pkgPath)) {
        continue;
      }

      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as PackageJson;
      const errors = validateExportEntry(pkg, pkgDir, fe);
      const warnings = [
        ...validateSecondaryExports(pkg, pkgDir, fe),
        ...validatePackageFields(pkg, pkgDir, fe),
      ];
      results.push({ packageName: pkg.name || dir, valid: errors.length === 0, errors, warnings });
    }

    if (options.json) {
      logger.json(results);
    } else {
      for (const r of results) {
        if (r.errors.length > 0 || r.warnings.length > 0) {
          r.errors.forEach((_e) => {});
          r.warnings.forEach((_w) => {});
        }
      }
      const _valid = results.filter((r) => r.valid).length;
    }

    if (results.some((r) => r.errors.length > 0)) {
      process.exit(1);
    }
  },
});

if (process.argv[1]?.includes('validate-packages-exports')) {
  cli.parse(process.argv);
}
