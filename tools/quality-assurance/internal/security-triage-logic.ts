import { z } from 'zod';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface Vulnerability {
  readonly name: string;
  readonly severity: SeverityLevel;
  readonly package: string;
  readonly patchedVersion: string | null;
}

export interface RiskAssessment {
  readonly confidentiality: SeverityLevel;
  readonly integrity: SeverityLevel;
  readonly availability: SeverityLevel;
  readonly score: number;
}

export interface RemediationStatus {
  readonly identified: boolean;
  readonly inProgress: boolean;
  readonly fixed: boolean;
  readonly verified: boolean;
}

export interface SecurityTriageReport {
  readonly total: number;
  readonly critical: number;
  readonly high: number;
  readonly medium: number;
  readonly low: number;
  readonly insights: readonly string[];
}

export const SeveritySchema = z.enum(['critical', 'high', 'medium', 'low']);

export const VulnerabilitySchema = z.object({
  name: z.string(),
  severity: SeveritySchema,
  package: z.string(),
  patchedVersion: z.string().nullable(),
});

export function classifySeverity(severity: string): SeverityLevel {
  const normalized = severity.toLowerCase();
  if (normalized === 'critical') {
    return 'critical';
  }
  if (normalized === 'high') {
    return 'high';
  }
  if (normalized === 'medium') {
    return 'medium';
  }
  return 'low';
}

export function calculateRiskScore(assessment: Omit<RiskAssessment, 'score'>): number {
  const severityToNumber: Record<SeverityLevel, number> = {
    critical: 10,
    high: 7.5,
    medium: 5,
    low: 2.5,
  };

  const avg =
    (severityToNumber[assessment.confidentiality] +
      severityToNumber[assessment.integrity] +
      severityToNumber[assessment.availability]) /
    3;

  return Number(avg.toFixed(1));
}

export function prioritizeRemediation(
  vulnerabilities: readonly Vulnerability[],
): readonly Vulnerability[] {
  const order: Record<SeverityLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...vulnerabilities].sort((a, b) => order[a.severity] - order[b.severity]);
}

export function generateInsights(vulnerabilities: readonly Vulnerability[]): readonly string[] {
  const insights: string[] = [];
  const critical = vulnerabilities.filter((v) => v.severity === 'critical');
  const high = vulnerabilities.filter((v) => v.severity === 'high');
  const medium = vulnerabilities.filter((v) => v.severity === 'medium');

  if (critical.length > 0) {
    insights.push(`Update all critical packages within 24 hours (${critical.length} found)`);
  }
  if (high.length > 0) {
    insights.push(`Schedule high severity fixes within 7 days (${high.length} found)`);
  }
  if (medium.length > 0) {
    insights.push(`Address medium severity in next sprint (${medium.length} found)`);
  }
  if (vulnerabilities.length === 0) {
    insights.push('No vulnerabilities detected - maintain current security posture');
  }

  return insights;
}

export function compileTriageReport(
  vulnerabilities: readonly Vulnerability[],
): SecurityTriageReport {
  return {
    total: vulnerabilities.length,
    critical: vulnerabilities.filter((v) => v.severity === 'critical').length,
    high: vulnerabilities.filter((v) => v.severity === 'high').length,
    medium: vulnerabilities.filter((v) => v.severity === 'medium').length,
    low: vulnerabilities.filter((v) => v.severity === 'low').length,
    insights: generateInsights(vulnerabilities),
  };
}

export function trackRemediationStatus(
  vulnerabilities: readonly Vulnerability[],
): RemediationStatus {
  const hasPatch = vulnerabilities.some((v) => v.patchedVersion !== null);
  return {
    identified: vulnerabilities.length > 0,
    inProgress: hasPatch,
    fixed: false,
    verified: false,
  };
}
