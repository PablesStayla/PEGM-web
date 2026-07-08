import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import type { CoverageGap, CoverageSummary, Priority } from './coverage-types.js';
import { CONTEXT_REASONS, PRIORITY_KEYWORDS } from './coverage-types.js';

export function getTypeScriptFiles(dir: string): readonly string[] {
  const files: string[] = [];

  const traverse = (currentDir: string): void => {
    const entries = readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('__tests__')) {
        traverse(fullPath);
      } else if (isValidTsFile(entry.name)) {
        files.push(fullPath);
      }
    }
  };

  traverse(dir);
  return files;
}

export function isValidTsFile(name: string): boolean {
  return (
    name.endsWith('.ts') &&
    !name.endsWith('.test.ts') &&
    !name.endsWith('.spec.ts') &&
    !name.endsWith('.d.ts')
  );
}

export function hasTestFile(sourceFile: string): boolean {
  const dir = dirname(sourceFile);
  const baseName = sourceFile.replace(/\.ts$/, '');
  const patterns = [
    `${baseName}.test.ts`,
    `${baseName}.spec.ts`,
    join(dir, '__tests__', `${baseName.split(/[/\\]/).pop()}.test.ts`),
  ];
  return patterns.some((p) => existsSync(p));
}

export function calculatePriority(file: string): Priority {
  const lower = file.toLowerCase();
  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return priority as Priority;
    }
  }
  return 'low';
}

export function getReason(file: string, context: string): string {
  const matchedContext = Object.entries(CONTEXT_REASONS).find(
    ([key]) => context === key || file.includes(key),
  );
  return matchedContext ? matchedContext[1] : 'No test coverage detected';
}

export function createGap(file: string, rootDir: string, context: string): CoverageGap {
  return {
    file: relative(rootDir, file),
    priority: calculatePriority(file),
    reason: getReason(file, context),
  };
}

export function createCoverageSummary(gaps: readonly CoverageGap[]): CoverageSummary {
  return {
    total: gaps.length,
    critical: gaps.filter((g) => g.priority === 'critical').length,
    high: gaps.filter((g) => g.priority === 'high').length,
    medium: gaps.filter((g) => g.priority === 'medium').length,
    low: gaps.filter((g) => g.priority === 'low').length,
    gaps,
  };
}

export function analyzeDirectory(
  dir: string,
  context: string,
  rootDir: string,
): readonly CoverageGap[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files = getTypeScriptFiles(dir);
  return files
    .filter((file) => !hasTestFile(file))
    .map((file) => createGap(file, rootDir, context));
}
