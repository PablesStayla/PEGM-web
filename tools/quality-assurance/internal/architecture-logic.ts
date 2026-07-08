export interface ArchFinding {
  readonly type: 'CRITICAL' | 'WARNING' | 'FORBIDDEN_IMPORT';
  readonly line: number;
  readonly message: string;
  readonly filePath: string;
}

export interface GigantismConfig {
  readonly maxLines: number;
  readonly targetLines: number;
}

export const DEFAULT_GIGANTISM_CONFIG: GigantismConfig = {
  maxLines: 200,
  targetLines: 120,
};

export interface ForbiddenImportRule {
  readonly pattern: RegExp;
  readonly restrictedIn: readonly string[];
  readonly message: string;
}

export const FORBIDDEN_IMPORT_RULES: readonly ForbiddenImportRule[] = [
  {
    pattern: /import.*from\s+['"]@pranakaia\/web/,
    restrictedIn: ['packages/ui', 'packages/core', 'packages/db'],
    message: 'Layer violation: core/ui packages cannot import from @pranakaia/web.',
  },
  {
    pattern: /import.*from\s+['"]\.\.\/\.\.\/apps/,
    restrictedIn: ['packages/'],
    message: 'Direct access forbidden: packages must not use relative paths to apps/.',
  },
];

export function shouldSkipFile(normalizedPath: string, ext: string): boolean {
  if (ext === '.json' || ext === '.md') {
    return true;
  }
  if (normalizedPath.includes('/migrations/') || normalizedPath.includes('/meta/')) {
    return true;
  }
  if (normalizedPath.includes('database.types.ts') || normalizedPath.includes('schema.ts')) {
    return true;
  }
  if (
    normalizedPath.includes('__tests__') ||
    normalizedPath.includes('__mocks__') ||
    normalizedPath.includes('.test.')
  ) {
    return true;
  }
  if (!normalizedPath.includes('/src/')) {
    return true;
  }
  return false;
}

export function checkGigantism(
  lineCount: number,
  filePath: string,
  config: GigantismConfig,
): ArchFinding[] {
  if (lineCount > config.maxLines) {
    return [
      {
        type: 'CRITICAL',
        line: lineCount,
        message: `File too long (${lineCount} lines). Hard limit: ${config.maxLines}. Refactor required.`,
        filePath,
      },
    ];
  }

  if (lineCount > config.targetLines) {
    return [
      {
        type: 'WARNING',
        line: lineCount,
        message: `File exceeds ${config.targetLines} line target (${lineCount} lines). Consider splitting.`,
        filePath,
      },
    ];
  }

  return [];
}

export function checkForbiddenImports(
  lines: readonly string[],
  filePath: string,
  rules: readonly ForbiddenImportRule[],
): ArchFinding[] {
  const findings: ArchFinding[] = [];

  for (const rule of rules) {
    const isRestricted = rule.restrictedIn.some((p) => filePath.includes(p));
    if (!isRestricted) {
      continue;
    }

    for (const [index, line] of lines.entries()) {
      rule.pattern.lastIndex = 0;
      if (rule.pattern.test(line)) {
        findings.push({
          type: 'FORBIDDEN_IMPORT',
          line: index + 1,
          message: rule.message,
          filePath,
        });
      }
    }
  }

  return findings;
}

export function analyzeFile(
  content: string,
  filePath: string,
  config: GigantismConfig,
  rules: readonly ForbiddenImportRule[],
): ArchFinding[] {
  const normalized = filePath.replace(/\\/g, '/');
  const ext = normalized.slice(normalized.lastIndexOf('.'));

  if (shouldSkipFile(normalized, ext)) {
    return [];
  }

  const lines = content.split(/\r?\n/);
  const findings: ArchFinding[] = [];

  findings.push(...checkGigantism(lines.length, normalized, config));
  findings.push(...checkForbiddenImports(lines, normalized, rules));

  return findings;
}
