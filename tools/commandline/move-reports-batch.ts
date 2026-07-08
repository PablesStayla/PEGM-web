/**
 * Report file patterns to match
 */
export const REPORT_PATTERNS = [
  'FINAL_*.md',
  'MULTISWARM_*.md',
  'QUALITY_*.md',
  'VALIDATION_*.md',
  'README_IMPROVEMENTS.md',
  'task_plan.md',
  'findings.md',
  'progress.md',
  'BUNDLE_OPTIMIZATION_*.md',
] as const;

/**
 * Target directory for reports
 */
export const TARGET_DIR = 'docs/reports';

/**
 * Convert glob pattern to regex
 * Pure function
 */
export function patternToRegex(pattern: string): RegExp {
  const regexPattern = pattern
    .replace(/\*\*/g, '<<<DOUBLESTAR>>>')
    .replace(/\*/g, '[^/]*')
    .replace(/<<<DOUBLESTAR>>>/g, '.*')
    .replace(/\//g, '\\/');

  return new RegExp(`^${regexPattern}$`);
}

/**
 * Check if filename should be moved
 * Pure function
 */
export function shouldMoveFile(filename: string): boolean {
  return REPORT_PATTERNS.some((pattern) => {
    const regex = patternToRegex(pattern);
    return regex.test(filename);
  });
}

/**
 * Get all matching files from directory
 * Pure function
 */
export function getMatchingFiles(dir: string): string[] {
  try {
    const files = fs.readdirSync(dir);
    return files.filter(shouldMoveFile);
  } catch {
    return [];
  }
}

import * as fs from 'node:fs';
