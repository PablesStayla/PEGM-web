/**
 * Validate All — Functional Core
 *
 * Pure functions for validation orchestration.
 * Shell execution injected via ExecPort.
 */
import type {
  CheckResult,
  ExecPort,
  ValidationCheck,
  ValidationSummary,
} from './validate-all-types.js';

/** All enterprise validation checks */
export const VALIDATION_CHECKS: readonly ValidationCheck[] = [
  {
    name: 'Environment',
    command: 'pnpm env:validate',
    critical: true,
    description: 'Validate environment variables',
  },
  {
    name: 'Package Validation',
    command: 'pnpm packages:validate',
    critical: true,
    description: 'Validate package.json files',
  },
  {
    name: 'Type Check',
    command: 'pnpm type-check',
    critical: true,
    description: 'TypeScript type checking',
  },
  { name: 'Lint', command: 'pnpm lint', critical: true, description: 'Code linting' },
  {
    name: 'Security Audit',
    command: 'pnpm security:audit',
    critical: true,
    description: 'Security vulnerability scan',
  },
  {
    name: 'Secrets Scan',
    command: 'pnpm security:secrets:check',
    critical: true,
    description: 'Scan for exposed secrets',
  },
  {
    name: 'Bundle Size',
    command: 'pnpm world-class:performance',
    critical: false,
    description: 'Bundle size validation',
  },
  {
    name: 'Accessibility',
    command: 'pnpm world-class:a11y',
    critical: false,
    description: 'Accessibility audit',
  },
  {
    name: 'SAST',
    command: 'pnpm world-class:sast',
    critical: false,
    description: 'Static Application Security Testing',
  },
] as const;

/** Get critical checks */
export function getCriticalChecks(): readonly ValidationCheck[] {
  return VALIDATION_CHECKS.filter((c) => c.critical);
}

/** Filter checks by names */
export function filterChecks(
  checks: readonly ValidationCheck[],
  names: string[],
): ValidationCheck[] {
  return checks.filter((c) => names.includes(c.name));
}

/** Run a single check */
export async function runCheck(exec: ExecPort, check: ValidationCheck): Promise<CheckResult> {
  const start = Date.now();
  try {
    await exec.exec(check.command, { maxBuffer: 10 * 1024 * 1024 });
    return { check: check.name, passed: true, duration: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { check: check.name, passed: false, duration: Date.now() - start, error: message };
  }
}

/** Run checks sequentially, stopping on critical failure */
export async function runChecksSequential(
  exec: ExecPort,
  checks: readonly ValidationCheck[],
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  for (const check of checks) {
    const result = await runCheck(exec, check);
    results.push(result);
    if (!result.passed && check.critical) {
      break;
    }
  }
  return results;
}

/** Build summary from results */
export function buildSummary(results: CheckResult[], startTime: number): ValidationSummary {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const criticalNames = getCriticalChecks().map((c) => c.name);
  const criticalFailures = results.filter(
    (r) => !r.passed && criticalNames.includes(r.check),
  ).length;
  return {
    total: results.length,
    passed,
    failed,
    criticalFailures,
    duration: Date.now() - startTime,
    results,
  };
}
