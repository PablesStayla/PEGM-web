import type { ArchFinding } from './architecture-logic.js';

export type SeverityLevel = 'CRITICAL' | 'WARNING' | 'GIGANTISM' | 'FORBIDDEN_IMPORT';

export interface StaffAuditStats {
  readonly totalFiles: number;
  readonly findings: readonly ArchFinding[];
}

export interface SubAuditConfig {
  readonly name: string;
  readonly candidates: readonly string[];
}

export const SCAN_ROOTS = ['apps', 'packages', 'scripts'] as const;

export const SUB_AUDIT_SCRIPTS: readonly SubAuditConfig[] = [
  {
    name: 'Security triage',
    candidates: ['tools/quality-assurance/triage-security-vulnerabilities.ts'],
  },
  {
    name: 'Foundation audit',
    candidates: ['tools/quality-assurance/audit-foundation-health.ts'],
  },
] as const;

export function toPosixPath(value: string): string {
  return value.replace(/\\/g, '/');
}

export function resolveFirstExisting(
  candidates: readonly string[],
  fileExists: (p: string) => boolean,
): string | null {
  for (const script of candidates) {
    if (fileExists(script)) {
      return script;
    }
  }
  return null;
}

export function classifyFindingType(type: string): SeverityLevel {
  if (type === 'CRITICAL') {
    return 'CRITICAL';
  }
  if (type === 'WARNING') {
    return 'WARNING';
  }
  if (type === 'GIGANTISM') {
    return 'GIGANTISM';
  }
  return 'FORBIDDEN_IMPORT';
}

export function formatStaffSummary(
  stats: StaffAuditStats,
  subAuditFailures: readonly string[],
): string {
  const lines: string[] = [
    'Staff Audit Summary:',
    `  Files analyzed: ${stats.totalFiles}`,
    `  Findings: ${stats.findings.length}`,
    `  Sub-audit failures: ${subAuditFailures.length}`,
  ];

  if (stats.findings.length > 0) {
    for (const f of stats.findings) {
      const emoji = f.type === 'CRITICAL' ? '[!]' : f.type === 'WARNING' ? '[?]' : '[X]';
      lines.push(`  ${emoji} [${f.type}] ${f.filePath}:${f.line} -> ${f.message}`);
    }
  }

  if (subAuditFailures.length > 0) {
    for (const failure of subAuditFailures) {
      lines.push(`  [FAIL] ${failure}`);
    }
  }

  return lines.join('\n');
}

export function determineExitCode(
  stats: StaffAuditStats,
  subAuditFailures: readonly string[],
  isStrict: boolean,
): number {
  if (subAuditFailures.length > 0) {
    return 1;
  }
  if (stats.findings.length > 0 && isStrict) {
    return 1;
  }
  return 0;
}
