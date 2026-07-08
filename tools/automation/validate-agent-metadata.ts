#!/usr/bin/env tsx
/**
 * Validate Agent Metadata
 *
 * Validates frontmatter in agent and prompt markdown files.
 *
 * @example
 * ```bash
 * pnpm validate:agents
 * pnpm validate:agents --verbose
 * pnpm validate:agents --json
 * ```
 */
import { readFileSync } from 'node:fs';
import { glob } from 'tinyglobby';
import { validateAllFiles } from '../lib/validate-agent-metadata-logic.js';
import type { AgentFsPort, ValidationResult } from '../lib/validate-agent-metadata-types.js';
import { AgentValidateOptionsSchema } from '../lib/validate-agent-metadata-types.js';
import { createCli, logger } from '../libraries/create-cli.js';

/** Real filesystem adapter */
const realFs: AgentFsPort = {
  readFile(path: string): string {
    return readFileSync(path, 'utf-8');
  },
  async glob(patterns: string[]): Promise<string[]> {
    return glob(patterns);
  },
  cwd(): string {
    return process.cwd();
  },
};

/** Display validation results */
function displayResults(results: readonly ValidationResult[]): void {
  const failed = results.filter((r) => !r.valid);
  if (failed.length === 0) {
    logger.success('All agent and prompt files passed validation');
    return;
  }

  logger.error(`Validation Failed: ${failed.length} file(s) failed`);
  for (const r of failed) {
    if (r.reason) {
      logger.error(`  ${r.file}: ${r.reason}`);
    } else if (r.missing) {
      logger.error(`  ${r.file}: missing: ${r.missing.join(', ')}`);
    }
  }
}

/** CLI — Imperative Shell */
const cli = createCli({
  name: 'agent-validator',
  version: '2.0.0',
  description: 'Validate agent and prompt frontmatter',
  action: async (options) => {
    const parsed = AgentValidateOptionsSchema.safeParse({
      verbose: options.verbose ?? false,
      json: options.json ?? false,
      dryRun: options.dryRun ?? false,
    });
    if (!parsed.success) {
      logger.error(`Invalid options: ${parsed.error.message}`);
      process.exit(1);
    }

    const root = realFs.cwd();
    logger.step('Finding agent and prompt files...');

    const results = await validateAllFiles(realFs, root);
    const failed = results.filter((r) => !r.valid).length;

    if (parsed.data.json) {
      logger.json({ total: results.length, failed, results });
    } else {
      displayResults(results);
    }

    if (failed > 0) {
      process.exit(2);
    }
    process.exit(0);
  },
});

if (process.argv[1]?.includes('validate-agent-metadata')) {
  cli.parse(process.argv);
}
