#!/usr/bin/env tsx
import { existsSync, readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import type { LintResult } from './internal/docs-lint-logic.js';
import { compileLintResults, lintContent } from './internal/docs-lint-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
  readonly docsDir?: string;
}

async function lintDirectory(dirPath: string): Promise<LintResult[]> {
  const results: LintResult[] = [];

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      const relPath = relative(process.cwd(), fullPath);

      if (entry.isDirectory()) {
        const nestedResults = await lintDirectory(fullPath);
        results.push(...nestedResults);
      } else if (entry.name.endsWith('.md')) {
        const content = readFileSync(fullPath, 'utf-8');
        const lintResults = lintContent(content, relPath.replace(/\\/g, '/'));
        results.push(...lintResults);
      }
    }
  } catch {
    // Ignore directory read errors
  }

  return results;
}

async function main(options: Options): Promise<void> {
  const docsDir = options.docsDir || join(process.cwd(), 'docs');

  logger.step('Starting documentation lint...\n');

  if (!existsSync(docsDir)) {
    logger.info('No docs/ directory found, skipping documentation lint.');
    return;
  }

  if (options.dryRun) {
    logger.info('Dry run mode - no linting will be performed');
    return;
  }

  const results = await lintDirectory(docsDir);
  const { errors, warnings, fileCount } = compileLintResults(results);

  if (options.json) {
    logger.json({ files: fileCount, errors: errors.length, warnings: warnings.length, results });
  } else {
    if (warnings.length > 0) {
      console.warn('\nContent Warnings:');
      warnings.forEach((w) => console.warn(` - ${w.file} -> ${w.message}`));
    }

    if (errors.length > 0) {
      console.error('\nDocumentation standards violated:');
      errors.forEach((e) => console.error(` - ${e.file} -> ${e.message}`));
      process.exit(1);
    } else {
    }
  }
}

const cli = createCli<Options>({
  name: 'lint-docs-style',
  version: '2.0.0',
  description: 'Lint documentation for enterprise standards',
  action: main,
});

if (process.argv[1]?.includes('lint-docs-style')) {
  cli.parse(process.argv);
}
