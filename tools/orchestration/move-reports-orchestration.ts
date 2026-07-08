#!/usr/bin/env tsx
/**
 * Reports Auto-Move Script
 *
 * Automatically moves generated .md report files from root to docs/reports/
 * This script runs automatically after report generation
 *
 * Usage:
 * pnpm exec tsx scripts/reports-auto-move.ts
 *
 * Or add to package.json scripts:
 * "post-generate-report": "tsx scripts/reports-auto-move.ts"
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const REPORT_PATTERNS = [
  'FINAL_*.md',
  'MULTISWARM_*.md',
  'QUALITY_*.md',
  'VALIDATION_*.md',
  'README_IMPROVEMENTS.md',
  'task_plan.md',
  'findings.md',
  'progress.md',
  'BUNDLE_OPTIMIZATION_*.md',
];

const TARGET_DIR = 'docs/reports';

interface MoveResult {
  file: string;
  success: boolean;
  error?: string;
}

function shouldMoveFile(filename: string): boolean {
  return REPORT_PATTERNS.some((pattern) => {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\*\*/g, '<<<DOUBLESTAR>>>')
      .replace(/\*/g, '[^/]*')
      .replace(/<<<DOUBLESTAR>>>/g, '.*');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filename);
  });
}

function moveReports(): MoveResult[] {
  const results: MoveResult[] = [];
  const rootDir = process.cwd();
  const targetDir = path.join(rootDir, TARGET_DIR);

  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Read root directory
  const files = fs.readdirSync(rootDir);

  for (const file of files) {
    if (shouldMoveFile(file)) {
      const sourcePath = path.join(rootDir, file);
      const targetPath = path.join(targetDir, file);

      try {
        // Check if it's a file (not directory)
        const stat = fs.statSync(sourcePath);
        if (!stat.isFile()) {
          continue;
        }

        // Check if file already exists in target
        if (fs.existsSync(targetPath)) {
          // Backup existing file with timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const backupPath = `${targetPath}.${timestamp}.backup`;
          fs.renameSync(targetPath, backupPath);
        }

        // Move file
        fs.renameSync(sourcePath, targetPath);
        results.push({ file, success: true });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to move ${file}: ${errorMsg}`);
        results.push({ file, success: false, error: errorMsg });
      }
    }
  }

  return results;
}

function main() {
  const results = moveReports();

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  if (failed.length > 0) {
    failed.forEach((_f) => {});
    process.exit(1);
  }

  if (successful.length === 0) {
  } else {
  }
}

main();
