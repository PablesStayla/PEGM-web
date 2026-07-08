/**
 * Secret Detection Patterns — Functional Core
 *
 * Pure data + pure functions for secret pattern matching.
 * Moved from security-audit/define-secret-patterns.ts.
 */
export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface SecretPattern {
  readonly name: string;
  readonly pattern: RegExp;
  readonly severity: Severity;
  readonly description: string;
}

/** All secret detection patterns */
export const SECRET_PATTERNS: readonly SecretPattern[] = [
  {
    name: 'AWS Access Key',
    pattern: /\b(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\b/g,
    severity: 'critical',
    description: 'AWS Access Key ID',
  },
  {
    name: 'AWS Secret Key',
    pattern: /\b[A-Za-z0-9/+=]{40}\b/g,
    severity: 'critical',
    description: 'Potential AWS Secret Access Key',
  },
  {
    name: 'GitHub Token',
    pattern: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36}\b/g,
    severity: 'critical',
    description: 'GitHub Personal Access Token',
  },
  {
    name: 'GitHub OAuth',
    pattern: /\bgho_[A-Za-z0-9]{36}\b/g,
    severity: 'high',
    description: 'GitHub OAuth Access Token',
  },
  {
    name: 'Stripe API Key',
    pattern: /\b(sk_live_|sk_test_|pk_live_|pk_test_)[A-Za-z0-9]{24,}\b/g,
    severity: 'critical',
    description: 'Stripe API Key',
  },
  {
    name: 'Stripe Restricted Key',
    pattern: /\brk_live_[A-Za-z0-9]{24,}\b/g,
    severity: 'critical',
    description: 'Stripe Restricted Key',
  },
  {
    name: 'Google API Key',
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,
    severity: 'high',
    description: 'Google API Key',
  },
  {
    name: 'Google OAuth',
    pattern: /\b[0-9]+-[a-z0-9_]{32}\.apps\.googleusercontent\.com\b/g,
    severity: 'medium',
    description: 'Google OAuth Client ID',
  },
  {
    name: 'Password in URL',
    pattern: /\b[a-zA-Z][a-zA-Z0-9]*:\/\/[^:]+:[^@]+@/g,
    severity: 'high',
    description: 'Password embedded in URL',
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    severity: 'critical',
    description: 'Private key detected',
  },
  {
    name: 'NPM Token',
    pattern: /\bnpm_[A-Za-z0-9]{36}\b/g,
    severity: 'high',
    description: 'NPM access token',
  },
  {
    name: 'Slack Token',
    pattern: /\bxox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*?\b/g,
    severity: 'high',
    description: 'Slack token',
  },
  {
    name: 'Supabase Key',
    pattern: /\b(eyJ[A-Za-z0-9-_]{150,})\b/g,
    severity: 'high',
    description: 'Potential Supabase key',
  },
  {
    name: 'Generic API Key',
    pattern: /\b(api[_-]?key|apikey|api_secret)[\s]*[=:]\s*["']?[A-Za-z0-9_-]{16,}["']?/gi,
    severity: 'medium',
    description: 'Generic API key',
  },
  {
    name: 'DB Connection',
    pattern: /\b(mongodb|postgres|mysql|redis):\/\/[^:]+:[^@]+@/gi,
    severity: 'critical',
    description: 'Database connection string with credentials',
  },
] as const;

/** Files and patterns to ignore */
export const IGNORE_PATTERNS = [
  /node_modules/,
  /dist/,
  /build/,
  /\.git/,
  /\.next/,
  /coverage/,
  /\.turbo/,
  /pnpm-lock\.yaml$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /\.min\./,
  /\.test\./,
  /\.spec\./,
  /__tests__/,
  /\.md$/,
  /\.lock$/,
] as const;

/** Sort findings by severity */
export function sortBySeverity<T extends { severity: Severity }>(items: T[]): T[] {
  const order: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return items.sort((a, b) => order[a.severity] - order[b.severity]);
}

/** Check if a file path should be ignored */
export function shouldIgnoreFile(filePath: string): boolean {
  return IGNORE_PATTERNS.some((p) => p.test(filePath));
}
