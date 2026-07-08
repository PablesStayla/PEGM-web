#!/usr/bin/env tsx
/**
 * Audit Secrets
 *
 * Scans codebase for exposed secrets, API keys, and credentials.
 *
 * @example
 * ```bash
 * pnpm audit:secrets
 * pnpm audit:secrets --dir apps/web
 * pnpm audit:secrets --json
 * ```
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { relative } from 'node:path';
import { countCriticalOrHigh, prepareResults, scanDirectory } from '../lib/audit-secrets-logic.js';
import type { SecretScanPort } from '../lib/audit-secrets-types.js';
import { AuditSecretsOptionsSchema } from '../lib/audit-secrets-types.js';
import { shouldIgnoreFile } from '../lib/secret-patterns-logic.js';
import { createCli, logger } from '../libraries/create-cli.js';
import { scanContent } from './scan-secrets-patterns.js';

const realPort: SecretScanPort = {
  readFile: (p) => readFile(p, 'utf-8'),
  readDir: (p) => readdir(p).then((e) => e.map((x) => x.name)),
  isDirectory: (p) =>
    stat(p)
      .then((s) => s.isDirectory())
      .catch(() => false),
  shouldIgnore: shouldIgnoreFile,
  scanContent,
};

const cli = createCli({
  name: 'scan-secrets-exposed',
  version: '2.0.0',
  description: 'Scan codebase for exposed secrets',
  options: [{ flags: '--directory <path>', description: 'Directory to scan' }],
  action: async (options) => {
    const parsed = AuditSecretsOptionsSchema.safeParse({
      directory: options.directory,
      verbose: options.verbose ?? false,
      json: options.json ?? false,
      dryRun: options.dryRun ?? false,
    });
    if (!parsed.success) {
      logger.error(parsed.error.message);
      process.exit(1);
    }

    const targetDir = parsed.data.directory ?? process.cwd();
    logger.step('Starting secrets audit...');
    logger.info(`Scanning: ${relative(process.cwd(), targetDir)}`);

    if (parsed.data.dryRun) {
      logger.warning('Dry run mode');
      return;
    }

    const { findings, filesScanned } = await scanDirectory(realPort, targetDir);
    const sorted = prepareResults(findings);

    if (parsed.data.json) {
      logger.json({ filesScanned, secretsFound: sorted.length, findings: sorted });
    } else {
      logger.info(`Files scanned: ${filesScanned}`);
      if (sorted.length === 0) {
        logger.success('No secrets detected');
      } else {
        logger.warning(`Found ${sorted.length} potential secret(s)`);
        for (const f of sorted) {
          logger.error(`  ${f.pattern} — ${f.file}:${f.line}`);
        }
      }
    }

    const critical = countCriticalOrHigh(sorted);
    if (critical > 0) {
      logger.error(`${critical} critical/high issue(s)`);
      process.exit(1);
    }
    process.exit(0);
  },
});

if (process.argv[1]?.includes('scan-secrets-exposed')) {
  cli.parse(process.argv);
}
