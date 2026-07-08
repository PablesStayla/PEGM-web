#!/usr/bin/env tsx
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import type { PackageJson } from '../libraries/types.js';
import type { PackageValidationResult } from './internal/validate-packages-logic.js';
import { compilePackageValidation } from './internal/validate-packages-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
  readonly packagesDir?: string;
}

async function readPackageJson(path: string): Promise<PackageJson> {
  const content = await readFile(path, 'utf-8');
  return JSON.parse(content) as PackageJson;
}

async function main(options: Options): Promise<void> {
  const packagesDir = options.packagesDir || join(process.cwd(), 'packages');

  logger.step('Scanning packages...');

  if (options.dryRun) {
    logger.info('Dry run mode - no validation will be performed');
    return;
  }

  const packages = (await readdir(packagesDir)).filter((pkg) => !pkg.startsWith('.'));
  const results: PackageValidationResult[] = [];

  for (const pkg of packages) {
    const pkgPath = join(packagesDir, pkg);
    const pkgStat = await stat(pkgPath);

    if (!pkgStat.isDirectory()) {
      continue;
    }

    try {
      const pkgJson = await readPackageJson(join(pkgPath, 'package.json'));
      const result = compilePackageValidation(pkgJson, pkgPath, (_p) => {
        throw new Error('sync check not supported in async context');
      });

      const asyncErrors: string[] = [];
      if (pkgJson.exports) {
        for (const [exportPath, exportValue] of Object.entries(pkgJson.exports)) {
          if (typeof exportValue === 'string') {
            const filePath = join(pkgPath, exportValue.replace('./', ''));
            try {
              await stat(filePath);
            } catch {
              asyncErrors.push(
                `Export "${exportPath}" points to non-existent file: ${exportValue}`,
              );
            }
          }
        }
      }

      const allErrors = [...result.errors, ...asyncErrors];
      results.push({ ...result, errors: allErrors, valid: allErrors.length === 0 });

      if (options.verbose) {
        if (result.valid) {
          logger.success(`${result.name}@${result.version}`);
        } else {
          logger.error(`${result.name}@${result.version}`);
          allErrors.forEach((err) => logger.error(` - ${err}`));
        }
      }
    } catch (error) {
      results.push({
        name: pkg,
        version: 'unknown',
        path: pkgPath,
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
      });
    }
  }

  const validCount = results.filter((r) => r.valid).length;
  const invalidCount = results.filter((r) => !r.valid).length;

  if (options.json) {
    logger.json({
      total: results.length,
      valid: validCount,
      invalid: invalidCount,
      packages: results,
    });
  } else {
    logger.step(`Validation complete: ${validCount}/${results.length} packages valid`);
    if (invalidCount > 0) {
      logger.error(`${invalidCount} package(s) failed validation`);
    }
  }

  if (invalidCount > 0) {
    process.exit(1);
  }
}

const cli = createCli<Options>({
  name: 'validate-packages-structure',
  version: '2.0.0',
  description: 'Validate all packages in the monorepo against enterprise standards',
  action: main,
});

if (process.argv[1]?.includes('validate-packages-structure')) {
  cli.parse(process.argv);
}
