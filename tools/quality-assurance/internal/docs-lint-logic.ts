export interface LintResult {
  readonly file: string;
  readonly message: string;
  readonly severity: 'error' | 'warning';
}

export const REQUIRED_SECTIONS = [
  '# Overview',
  '## Purpose',
  '## Prerequisites',
  '## Instructions',
] as const;

export const NAMING_PATTERN = /^[A-Z0-9_]+\.[a-z]{2,3}$/;

export const STRICT_DOC_PATTERNS = [
  /^docs\/audits\/AUDITORIA_MASTER_2026\.md$/i,
  /^docs\/portal\/.*\.md$/i,
  /^docs\/operations\/BUG_BOUNTY_.*\.md$/i,
  /^docs\/operations\/BUNDLE_REDUCTION_PLAN_M2\.md$/i,
  /^docs\/operations\/SLO_SLI_TARGETS_2026\.md$/i,
  /^docs\/operations\/runbooks\/DISASTER_RECOVERY_DRILL\.md$/i,
  /^docs\/reports\/(SECURITY_BUG_BOUNTY_MONTHLY|DR_DRILL_EVIDENCE_APR_2026)\.md$/i,
] as const;

export function isStrictDoc(relativePath: string): boolean {
  const posixRel = relativePath.replace(/\\/g, '/');
  return STRICT_DOC_PATTERNS.some((pattern) => pattern.test(posixRel));
}

export function checkNaming(fileName: string): LintResult | null {
  if (NAMING_PATTERN.test(fileName) || fileName.toLowerCase().startsWith('readme')) {
    return null;
  }
  return {
    file: '',
    message: `Naming convention violation: ${fileName} must be UPPERCASE_WITH_UNDERSCORES.md`,
    severity: 'error',
  };
}

export function checkRequiredSections(content: string): readonly LintResult[] {
  return REQUIRED_SECTIONS.filter((section) => !content.includes(section)).map((section) => ({
    file: '',
    message: `Missing required section: "${section}"`,
    severity: 'error' as const,
  }));
}

export function checkEmptySections(content: string): readonly LintResult[] {
  const emptySection = content.match(/^##\s+\w+\s*\n\s*\n##/gm);
  if (!emptySection) {
    return [];
  }
  return [{ file: '', message: 'Empty section detected', severity: 'warning' }];
}

export function checkIncompleteMarkers(content: string): readonly LintResult[] {
  const incomplete = content.match(/\b(TODO|FIXME|WIP)\b/g);
  if (!incomplete) {
    return [];
  }
  const unique = [...new Set(incomplete)];
  return [
    {
      file: '',
      message: `Contains incomplete markers: ${unique.join(', ')}`,
      severity: 'warning',
    },
  ];
}

export function lintContent(content: string, relativePath: string): readonly LintResult[] {
  if (!isStrictDoc(relativePath)) {
    return [];
  }

  const fileName = relativePath.replace(/\\/g, '/').split('/').pop() || '';
  const results: LintResult[] = [];

  const namingResult = checkNaming(fileName);
  if (namingResult) {
    results.push({ ...namingResult, file: relativePath });
  }

  const sectionResults = checkRequiredSections(content);
  results.push(...sectionResults.map((r) => ({ ...r, file: relativePath })));

  const emptyResults = checkEmptySections(content);
  results.push(...emptyResults.map((r) => ({ ...r, file: relativePath })));

  const markerResults = checkIncompleteMarkers(content);
  results.push(...markerResults.map((r) => ({ ...r, file: relativePath })));

  return results;
}

export function compileLintResults(results: readonly LintResult[]): {
  readonly errors: readonly LintResult[];
  readonly warnings: readonly LintResult[];
  readonly fileCount: number;
} {
  const errors = results.filter((r) => r.severity === 'error');
  const warnings = results.filter((r) => r.severity === 'warning');
  const fileCount = new Set(results.map((r) => r.file)).size;
  return { errors, warnings, fileCount };
}
