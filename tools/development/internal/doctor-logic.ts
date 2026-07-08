import type { Result } from '../../libraries/types.js';
import { failure, success } from '../../libraries/types.js';
import type { CheckResult, CheckSeverity, DoctorReport } from './doctor-types.js';
import { NodeVersionSchema, PnpmVersionSchema } from './doctor-types.js';

export function parseNodeVersion(
  versionString: string,
): Result<{ major: number; raw: string }, string> {
  if (!versionString.startsWith('v')) {
    return failure('Invalid Node.js version format');
  }
  const major = parseInt(versionString.slice(1).split('.')[0], 10);
  const parsed = NodeVersionSchema.safeParse({ major, raw: versionString });
  if (!parsed.success) {
    return failure(`Invalid version: ${parsed.error.message}`);
  }
  return success(parsed.data);
}

export function parsePnpmVersion(output: string): Result<{ major: number; raw: string }, string> {
  const version = output.trim();
  const major = parseInt(version.split('.')[0], 10);
  const parsed = PnpmVersionSchema.safeParse({ major, raw: version });
  if (!parsed.success) {
    return failure(`Invalid pnpm version: ${parsed.error.message}`);
  }
  return success(parsed.data);
}

export function checkNodeVersion(versionString: string, minMajor: number): CheckResult {
  const parsed = parseNodeVersion(versionString);
  if (!parsed.success) {
    return {
      name: `Node.js version (>=${minMajor}.0.0)`,
      passed: false,
      severity: 'required',
      error: parsed.error,
    };
  }
  const passed = parsed.data.major >= minMajor;
  return {
    name: `Node.js version (>=${minMajor}.0.0)`,
    passed,
    severity: 'required',
    fix: passed
      ? undefined
      : `Install Node.js ${minMajor}.x from https://nodejs.org/ or use nvm: nvm install ${minMajor}`,
  };
}

export function checkPnpmVersion(output: string, minMajor: number): CheckResult {
  const parsed = parsePnpmVersion(output);
  if (!parsed.success) {
    return {
      name: `pnpm version (>=${minMajor}.0.0)`,
      passed: false,
      severity: 'required',
      error: parsed.error,
    };
  }
  const passed = parsed.data.major >= minMajor;
  return {
    name: `pnpm version (>=${minMajor}.0.0)`,
    passed,
    severity: 'required',
    fix: passed ? undefined : `Install pnpm: npm install -g pnpm@${minMajor}`,
  };
}

export function checkFileExists(
  _filePath: string,
  label: string,
  severity: CheckSeverity,
  fix: string,
): CheckResult {
  return {
    name: label,
    passed: false,
    severity,
    fix,
  };
}

export function checkNoSecrets(content: string): CheckResult {
  const hasPassword = /password|secret|key.*=|token.*=/i.test(content);
  const hasConnectionString = /postgres:\/\/[^:]+:[^@]+@/i.test(content);
  const passed = !hasPassword && !hasConnectionString;
  return {
    name: 'No secrets in config',
    passed,
    severity: 'required',
    fix: passed ? undefined : 'Remove hardcoded secrets from config - use environment variables',
  };
}

export function compileDoctorReport(results: readonly CheckResult[]): DoctorReport {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed && r.severity === 'required').length;
  const warnings = results.filter((r) => !r.passed && r.severity === 'optional').length;
  return { passed, failed, warnings, results };
}

export function formatDoctorReport(report: DoctorReport): string {
  const lines: string[] = ['\x1b[36m\x1b[1mDX Doctor - Development Environment Check\x1b[0m\n'];
  for (const result of report.results) {
    const icon = result.passed
      ? '\x1b[32m✅'
      : result.severity === 'required'
        ? '\x1b[31m❌'
        : '\x1b[33m⚠️';
    lines.push(`${icon} ${result.name}\x1b[0m`);
    if (!result.passed && result.fix) {
      lines.push(`  \x1b[36mFix:\x1b[0m ${result.fix}`);
    }
    if (result.error) {
      lines.push(`  \x1b[33mError: ${result.error}\x1b[0m`);
    }
  }

  lines.push(`\n\x1b[36m📊 Results:\x1b[0m`);
  lines.push(`  \x1b[32m✅ ${report.passed} passed\x1b[0m`);
  if (report.warnings > 0) {
    lines.push(`  \x1b[33m⚠️ ${report.warnings} warnings\x1b[0m`);
  }
  if (report.failed > 0) {
    lines.push(`  \x1b[31m❌ ${report.failed} failed\x1b[0m`);
  }

  return lines.join('\n');
}

export function getExitCode(report: DoctorReport): number {
  return report.failed > 0 ? 1 : 0;
}
