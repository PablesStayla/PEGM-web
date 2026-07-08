export interface FoundationCheckResult {
  readonly file: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
}

export interface RequiredEntry {
  readonly key: string;
  readonly paths: readonly string[];
}

export const REQUIRED_ROOT_FILES: readonly RequiredEntry[] = [
  { key: 'README', paths: ['README.md'] },
  { key: 'LICENSE', paths: ['LICENSE'] },
  { key: 'CHANGELOG', paths: ['CHANGELOG.md'] },
  { key: 'SECURITY', paths: ['SECURITY.md', 'docs/operations/SECURITY.md'] },
  { key: 'package.json', paths: ['package.json'] },
  { key: '.gitignore', paths: ['.gitignore'] },
  { key: '.editorconfig', paths: ['.editorconfig'] },
] as const;

export const REQUIRED_DOCS: readonly RequiredEntry[] = [
  { key: 'Docs index', paths: ['docs/README.md'] },
  {
    key: 'Arquitectura',
    paths: [
      'docs/context/ARCHITECTURE.md',
      'docs/ARCHITECTURE.md',
      'docs/context/architecture-overview.md',
    ],
  },
  { key: 'Incidentes', paths: ['docs/operations/INCIDENT.md'] },
  { key: 'SLO/SLI', paths: ['docs/operations/SLO_SLI_TARGETS_2026.md'] },
  { key: 'Reglas de seguridad', paths: ['docs/rules/SECURITY_RULES.md'] },
] as const;

export const REQUIRED_CONFIGS: readonly RequiredEntry[] = [
  {
    key: 'Stryker config',
    paths: [
      'packages/config/stryker.config.json',
      'stryker.config.json',
      'config/stryker.config.json',
    ],
  },
  {
    key: 'Semgrep config',
    paths: ['packages/config/.semgrep.yml', '.semgrep.yml', 'config/.semgrep.yml'],
  },
  { key: 'Knip config', paths: ['.knip.ts', 'knip.json', 'knip.ts'] },
  {
    key: 'Depcheck config',
    paths: ['packages/config/.depcheckrc.json', '.depcheckrc.json', 'config/.depcheckrc.json'],
  },
  { key: 'Gitleaks ignore', paths: ['.gitleaksignore'] },
  {
    key: 'Lighthouse config',
    paths: [
      '.lighthouserc.json',
      'config/.lighthouserc.json',
      '.lighthouserc.js',
      '.lighthouserc.ts',
    ],
  },
  { key: 'TypeScript config', paths: ['tsconfig.json'] },
  { key: 'Vitest config', paths: ['.vitest.config.ts', 'vitest.config.ts'] },
  {
    key: 'Playwright config',
    paths: [
      'packages/config/playwright.config.ts',
      'playwright.config.ts',
      'config/playwright.config.ts',
    ],
  },
] as const;

export const RECOMMENDED_GITHUB: readonly RequiredEntry[] = [
  {
    key: 'Issue template (bug)',
    paths: ['.github/ISSUE_TEMPLATE/bug.yml', '.github/ISSUE_TEMPLATE/bug_report.yml'],
  },
  {
    key: 'Issue template (feature)',
    paths: [
      '.github/ISSUE_TEMPLATE/feature-request.yml',
      '.github/ISSUE_TEMPLATE/feature_request.yml',
    ],
  },
  {
    key: 'PR template',
    paths: ['.github/pull_request_template.md', '.github/PULL_REQUEST_TEMPLATE.md'],
  },
] as const;

export const README_SECTION_PATTERNS = [
  { key: 'Quick Start', patterns: [/inicio\s+r[aá]pido/i, /quick\s+start/i] },
  { key: 'Stack', patterns: [/\bstack\b/i] },
  { key: 'Estructura', patterns: [/estructura/i, /structure/i] },
  { key: 'Seguridad', patterns: [/seguridad/i, /security/i] },
] as const;

export function resolveEntry(
  entry: RequiredEntry,
  fileExists: (p: string) => boolean,
): string | null {
  for (const candidate of entry.paths) {
    if (fileExists(candidate)) {
      return candidate;
    }
  }
  return null;
}

export function checkEntryList(
  list: readonly RequiredEntry[],
  severity: 'error' | 'warning',
  fileExists: (p: string) => boolean,
): readonly FoundationCheckResult[] {
  return list
    .filter((entry) => !resolveEntry(entry, fileExists))
    .map((entry) => ({
      file: entry.key,
      severity,
      message: `Missing expected file (checked: ${entry.paths.join(' | ')})`,
    }));
}

export function checkReadmeSections(content: string): readonly FoundationCheckResult[] {
  return README_SECTION_PATTERNS.filter(
    (section) => !section.patterns.some((pattern) => pattern.test(content)),
  ).map((section) => ({
    file: 'README.md',
    severity: 'warning' as const,
    message: `Missing section: ${section.key}`,
  }));
}

export function compileFoundationResults(
  fileExists: (p: string) => boolean,
  readReadme: () => string | null,
): readonly FoundationCheckResult[] {
  return [
    ...checkEntryList(REQUIRED_ROOT_FILES, 'error', fileExists),
    ...checkEntryList(REQUIRED_DOCS, 'warning', fileExists),
    ...checkEntryList(REQUIRED_CONFIGS, 'error', fileExists),
    ...checkEntryList(RECOMMENDED_GITHUB, 'warning', fileExists),
    ...checkReadmeSectionsSafe(readReadme),
  ];
}

function checkReadmeSectionsSafe(
  readReadme: () => string | null,
): readonly FoundationCheckResult[] {
  const content = readReadme();
  if (content === null) {
    return [];
  }
  return checkReadmeSections(content);
}

export function formatFoundationReport(results: readonly FoundationCheckResult[]): string {
  const errors = results.filter((r) => r.severity === 'error');
  const warnings = results.filter((r) => r.severity === 'warning');

  const lines: string[] = [
    `Project Files Summary:`,
    `  Errors: ${errors.length}`,
    `  Warnings: ${warnings.length}`,
  ];

  if (warnings.length > 0) {
    lines.push('\nMinor Omissions:');
    warnings.forEach((w) => lines.push(` - ${w.file} -> ${w.message}`));
  }

  if (errors.length > 0) {
    lines.push('\nCritical Files Missing:');
    errors.forEach((e) => lines.push(` - ${e.file} -> ${e.message}`));
  } else {
    lines.push('\nAll required project files are present.');
  }

  return lines.join('\n');
}
