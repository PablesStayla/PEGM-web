import { z } from 'zod';

export const A11yViolationSchema = z.object({
  id: z.string(),
  impact: z.enum(['critical', 'serious', 'moderate', 'minor']),
  description: z.string(),
  nodes: z.number().min(0),
});

export const A11yReportSchema = z.object({
  violations: z.array(A11yViolationSchema),
  passes: z.array(z.unknown()),
  incomplete: z.array(z.unknown()),
  inapplicable: z.array(z.unknown()),
});

export type A11yReport = z.infer<typeof A11yReportSchema>;

export interface A11yValidationResult {
  readonly valid: boolean;
  readonly score: number;
  readonly criticalCount: number;
}

export function validateAccessibility(report: A11yReport, threshold: number): A11yValidationResult {
  const criticalViolations = report.violations.filter((v) => v.impact === 'critical');
  const criticalCount = criticalViolations.length;

  const totalChecks = report.passes.length + report.violations.length;
  const passedChecks = report.passes.length;
  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;

  const valid = criticalCount === 0 && score >= threshold;

  return { valid, score, criticalCount };
}
