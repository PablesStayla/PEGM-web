import type { PackageJson } from '../../libraries/types.js';

export interface AuditCheck {
  readonly name: string;
  readonly passed: boolean;
  readonly critical: boolean;
  readonly message: string;
}

export interface AuditResult {
  readonly package: string;
  readonly score: number;
  readonly checks: readonly AuditCheck[];
}

export const REQUIRED_SCRIPTS = ['build', 'dev', 'type-check', 'test', 'lint', 'clean'] as const;
export const REQUIRED_FILES = ['README.md', 'CHANGELOG.md'] as const;

export function checkPackageStructure(pkg: PackageJson): readonly AuditCheck[] {
  return [
    {
      name: 'exports',
      passed: !!pkg.exports && Object.keys(pkg.exports).length > 0,
      critical: true,
      message: pkg.exports ? 'Has exports' : 'Missing exports field',
    },
    {
      name: 'types',
      passed: !!pkg.types,
      critical: true,
      message: pkg.types ? 'Has types field' : 'Missing types field',
    },
    {
      name: 'main',
      passed: !!pkg.main,
      critical: true,
      message: pkg.main ? 'Has main field' : 'Missing main field',
    },
    {
      name: 'module',
      passed: !!pkg.module,
      critical: true,
      message: pkg.module ? 'Has module field' : 'Missing module field',
    },
  ];
}

export function checkScripts(pkg: PackageJson): readonly AuditCheck[] {
  return REQUIRED_SCRIPTS.map((script) => {
    const hasScript = !!pkg.scripts?.[script];
    return {
      name: `script:${script}`,
      passed: hasScript,
      critical: false,
      message: hasScript ? `Has ${script} script` : `Missing ${script} script`,
    };
  });
}

export function checkFiles(
  pkgDir: string,
  fileExists: (p: string) => boolean,
): readonly AuditCheck[] {
  return REQUIRED_FILES.map((file) => {
    const exists = fileExists(`${pkgDir}/${file}`);
    return {
      name: `file:${file}`,
      passed: exists,
      critical: false,
      message: exists ? `${file} exists` : `Missing ${file}`,
    };
  });
}

export function calculateScore(checks: readonly AuditCheck[]): number {
  if (checks.length === 0) {
    return 0;
  }
  const passed = checks.filter((c) => c.passed).length;
  return Math.round((passed / checks.length) * 100);
}

export function compileAuditResult(
  pkg: PackageJson,
  pkgDir: string,
  fileExists: (p: string) => boolean,
): AuditResult {
  const allChecks = [
    ...checkPackageStructure(pkg),
    ...checkScripts(pkg),
    ...checkFiles(pkgDir, fileExists),
  ];

  return {
    package: pkg.name || pkgDir,
    score: calculateScore(allChecks),
    checks: allChecks,
  };
}

export function compileAuditSummary(results: readonly AuditResult[]): {
  readonly total: number;
  readonly averageScore: number;
  readonly belowThreshold: readonly AuditResult[];
} {
  if (results.length === 0) {
    return { total: 0, averageScore: 0, belowThreshold: [] };
  }

  const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
  const belowThreshold = results.filter((r) => r.score < 80);

  return { total: results.length, averageScore, belowThreshold };
}
