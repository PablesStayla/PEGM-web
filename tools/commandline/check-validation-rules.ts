/**
 * Enterprise Validation Checks Configuration
 * Defines all validation checks with metadata
 */

/**
 * Validation check definition
 */
export interface ValidationCheck {
  readonly name: string;
  readonly command: string;
  readonly critical: boolean;
  readonly description?: string;
}

/**
 * All validation checks organized by category
 */
export const VALIDATION_CHECKS: readonly ValidationCheck[] = [
  // Critical checks (must pass)
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
  {
    name: 'Lint',
    command: 'pnpm lint',
    critical: true,
    description: 'Code linting',
  },
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
  // Non-critical checks (warnings only)
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

/**
 * Get critical checks only
 */
export function getCriticalChecks(): readonly ValidationCheck[] {
  return VALIDATION_CHECKS.filter((check) => check.critical);
}

/**
 * Get non-critical checks
 */
export function getNonCriticalChecks(): readonly ValidationCheck[] {
  return VALIDATION_CHECKS.filter((check) => !check.critical);
}

/**
 * Get check by name
 */
export function getCheckByName(name: string): ValidationCheck | undefined {
  return VALIDATION_CHECKS.find((check) => check.name === name);
}

/**
 * Get all check names
 */
export function getCheckNames(): readonly string[] {
  return VALIDATION_CHECKS.map((check) => check.name);
}
