export interface CoverageEntry {
  readonly path: string;
  readonly s: Record<string, number>;
  readonly f: Record<string, number>;
  readonly b: Record<string, number[]>;
}

export interface CoverageThreshold {
  readonly statements: number;
  readonly functions: number;
  readonly branches: number;
}

export interface CoverageTarget {
  readonly fileSuffix: string;
  readonly threshold: CoverageThreshold;
}

export interface CoverageFailure {
  readonly target: string;
  readonly metric: string;
  readonly actual: number;
  readonly required: number;
}

export function percentage(covered: number, total: number): number {
  if (total === 0) {
    return 100;
  }
  return Number(((covered / total) * 100).toFixed(2));
}

export function toPosixPath(input: string): string {
  return input.replace(/\\/g, '/');
}

export function computeStatements(entry: CoverageEntry): number {
  const total = Object.keys(entry.s).length;
  const covered = Object.values(entry.s).filter((hits) => hits > 0).length;
  return percentage(covered, total);
}

export function computeFunctions(entry: CoverageEntry): number {
  const total = Object.keys(entry.f).length;
  const covered = Object.values(entry.f).filter((hits) => hits > 0).length;
  return percentage(covered, total);
}

export function computeBranches(entry: CoverageEntry): number {
  const branchGroups = Object.values(entry.b);
  const total = branchGroups.reduce((acc, hits) => acc + hits.length, 0);
  const covered = branchGroups.reduce(
    (acc, hits) => acc + hits.filter((value) => value > 0).length,
    0,
  );
  return percentage(covered, total);
}

export function findCoverageEntry(
  coverageMap: Record<string, CoverageEntry>,
  suffix: string,
): CoverageEntry | null {
  const normalizedSuffix = toPosixPath(suffix);

  for (const [key, entry] of Object.entries(coverageMap)) {
    if (
      toPosixPath(key).endsWith(normalizedSuffix) ||
      toPosixPath(entry.path).endsWith(normalizedSuffix)
    ) {
      return entry;
    }
  }

  return null;
}

export function checkCoverageTarget(
  coverageMap: Record<string, CoverageEntry>,
  target: CoverageTarget,
): readonly CoverageFailure[] {
  const failures: CoverageFailure[] = [];
  const entry = findCoverageEntry(coverageMap, target.fileSuffix);

  if (!entry) {
    failures.push({
      target: target.fileSuffix,
      metric: 'entry',
      actual: 0,
      required: 100,
    });
    return failures;
  }

  const statements = computeStatements(entry);
  const functions = computeFunctions(entry);
  const branches = computeBranches(entry);

  if (statements < target.threshold.statements) {
    failures.push({
      target: target.fileSuffix,
      metric: 'statements',
      actual: statements,
      required: target.threshold.statements,
    });
  }

  if (functions < target.threshold.functions) {
    failures.push({
      target: target.fileSuffix,
      metric: 'functions',
      actual: functions,
      required: target.threshold.functions,
    });
  }

  if (branches < target.threshold.branches) {
    failures.push({
      target: target.fileSuffix,
      metric: 'branches',
      actual: branches,
      required: target.threshold.branches,
    });
  }

  return failures;
}

export function runCoverageGate(
  coverageMap: Record<string, CoverageEntry>,
  targets: readonly CoverageTarget[],
): readonly CoverageFailure[] {
  const failures: CoverageFailure[] = [];

  for (const target of targets) {
    failures.push(...checkCoverageTarget(coverageMap, target));
  }

  return failures;
}

export function formatCoverageResult(target: CoverageTarget, entry: CoverageEntry | null): string {
  if (!entry) {
    return `${target.fileSuffix} -> NOT FOUND`;
  }

  const statements = computeStatements(entry);
  const functions = computeFunctions(entry);
  const branches = computeBranches(entry);

  return `${target.fileSuffix} -> statements=${statements}% functions=${functions}% branches=${branches}%`;
}
