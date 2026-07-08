import { describe, expect, it } from 'vitest';
import type { FileExistenceChecker, QaCheckResult } from './check-qa-gates.js';
import { checkFileExists, compileQaReport, formatQaReport } from './check-qa-gates.js';

const M6_FILES = [
  'docs/operations/BUNDLE_REDUCTION_PLAN_M2.md',
  'apps/web/src/lib/contracts/payment-provider-contracts.ts',
  'docs/operations/SLO_SLI_TARGETS_2026.md',
  'config/stryker.critical.config.json',
  'tests/load/k6/spike-test.js',
  'docs/operations/PENTEST_FINAL_M6.md',
] as const;

const M6_SCRIPTS = [
  'test:e2e:critical',
  'analyze:bundle:web',
  'test:mutation:critical',
  'load:spike',
  'audit:closure:m6',
] as const;

function checkPackageScript(
  scriptName: string,
  readPackageJson: () => { scripts?: Record<string, string> } | null,
): QaCheckResult {
  const pkg = readPackageJson();
  if (!pkg) {
    return { name: `script:${scriptName}`, passed: false, detail: 'package.json missing' };
  }
  const ok = Boolean(pkg.scripts?.[scriptName]);
  return { name: `script:${scriptName}`, passed: ok, detail: ok ? 'configured' : 'not configured' };
}

function runM6Checks(
  fileExists: FileExistenceChecker,
  readPackageJson: () => { scripts?: Record<string, string> } | null,
): QaCheckResult[] {
  const fileChecks = M6_FILES.map((f) => checkFileExists(f, fileExists));
  const scriptChecks = M6_SCRIPTS.map((s) => checkPackageScript(s, readPackageJson));
  return [...fileChecks, ...scriptChecks];
}

describe('roadmap-m6-closure-check', () => {
  const allExist: FileExistenceChecker = () => true;
  const noneExist: FileExistenceChecker = () => false;
  const fullPkg = () => ({
    scripts: {
      'test:e2e:critical': 'pnpm playwright',
      'analyze:bundle:web': 'pnpm analyze',
      'test:mutation:critical': 'pnpm stryker',
      'load:spike': 'pnpm k6',
      'audit:closure:m6': 'pnpm audit',
    },
  });
  const noScripts = () => ({ scripts: {} });
  const noPkg = () => null;

  describe('runM6Checks', () => {
    it('should pass all checks when files and scripts exist', () => {
      const results = runM6Checks(allExist, fullPkg);
      const failures = results.filter((r) => !r.passed);
      expect(failures).toHaveLength(0);
    });

    it('should fail when files missing', () => {
      const results = runM6Checks(noneExist, fullPkg);
      const fileFailures = results.filter((r) => !r.passed && !r.name.startsWith('script:'));
      expect(fileFailures.length).toBe(M6_FILES.length);
    });

    it('should fail when scripts not configured', () => {
      const results = runM6Checks(allExist, noScripts);
      const scriptFailures = results.filter((r) => !r.passed && r.name.startsWith('script:'));
      expect(scriptFailures.length).toBe(M6_SCRIPTS.length);
    });

    it('should fail when package.json missing', () => {
      const results = runM6Checks(allExist, noPkg);
      const scriptFailures = results.filter((r) => !r.passed && r.name.startsWith('script:'));
      expect(scriptFailures).toHaveLength(M6_SCRIPTS.length);
      expect(scriptFailures.every((r) => r.detail === 'package.json missing')).toBe(true);
    });

    it('should compile passing report', () => {
      const results = runM6Checks(allExist, fullPkg);
      const report = compileQaReport(results);
      expect(report.failed).toBe(0);
    });

    it('should compile failing report', () => {
      const results = runM6Checks(noneExist, noPkg);
      const report = compileQaReport(results);
      expect(report.failed).toBeGreaterThan(0);
    });

    it('should format report', () => {
      const results = runM6Checks(allExist, fullPkg);
      const report = compileQaReport(results);
      const output = formatQaReport(report, 'Roadmap M6 closure');
      expect(output).toContain('Roadmap M6 closure');
    });
  });

  describe('dropshipping scenarios', () => {
    it('should validate payment provider contracts file', () => {
      const exists: FileExistenceChecker = (p) => p.includes('payment-provider');
      const results = runM6Checks(exists, fullPkg);
      const contractsCheck = results.find((r) => r.name.includes('payment-provider'));
      expect(contractsCheck?.passed).toBe(true);
    });
  });
});
