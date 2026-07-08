#!/usr/bin/env tsx
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import type { ArchFinding } from './internal/architecture-logic.js';
import {
  analyzeFile,
  DEFAULT_GIGANTISM_CONFIG,
  FORBIDDEN_IMPORT_RULES,
} from './internal/architecture-logic.js';
import { walkDir as getAllFiles } from './internal/audit-utils.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

const SCAN_DIRS = ['apps', 'packages'];

function _formatFindings(findings: readonly ArchFinding[]): string {
  if (findings.length === 0) {
    return 'No architecture violations detected.';
  }

  const byFile: Record<string, ArchFinding[]> = {};
  for (const f of findings) {
    if (!byFile[f.filePath]) {
      byFile[f.filePath] = [];
    }
    byFile[f.filePath].push(f);
  }

  const lines: string[] = [];
  for (const [file, fileFindings] of Object.entries(byFile)) {
    lines.push(`\nFile: ${file}`);
    for (const f of fileFindings) {
      lines.push(`  [${f.type}] Line ${f.line}: ${f.message}`);
    }
  }

  lines.push(`\nTotal findings: ${findings.length}`);
  return lines.join('\n');
}

async function main(options: Options): Promise<void> {
  logger.step('Running architecture shield scan...');

  const allFindings: ArchFinding[] = [];

  for (const dir of SCAN_DIRS) {
    const rootPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(rootPath)) {
      continue;
    }

    const files = getAllFiles(rootPath).filter((f) => /\.(ts|tsx|js|jsx)$/.test(f));

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const findings = analyzeFile(
          content,
          file,
          DEFAULT_GIGANTISM_CONFIG,
          FORBIDDEN_IMPORT_RULES,
        );
        allFindings.push(...findings);
      } catch {}
    }
  }

  if (options.json) {
  } else {
  }

  const criticals = allFindings.filter((f) => f.type === 'CRITICAL').length;
  process.exit(criticals > 0 ? 1 : 0);
}

const cli = createCli<Options>({
  name: 'validate-architecture-shield',
  version: '2.0.0',
  description: 'Enforce architectural rules and file size limits',
  action: main,
});

if (process.argv[1]?.includes('validate-architecture-shield')) {
  cli.parse(process.argv);
}
