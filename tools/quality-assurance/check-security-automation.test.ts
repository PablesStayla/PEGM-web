import { describe, expect, it } from 'vitest';
import { checkContentContains, compileQaReport, formatQaReport } from './check-qa-gates.js';

function runSecurityAutomationChecks(content: string) {
  return [
    checkContentContains(content, 'gitleaks', 'security:gitleaks-job'),
    checkContentContains(content, 'codeql', 'security:codeql-job'),
    checkContentContains(content, 'dependency-review', 'security:dependency-review-job'),
    checkContentContains(content, 'trivy-fs', 'security:trivy-fs-job'),
    checkContentContains(content, 'trivy-iac', 'security:trivy-iac-job'),
    checkContentContains(content, 'aquasecurity/trivy-action', 'security:trivy-action'),
  ];
}

describe('security-automation-check', () => {
  describe('runSecurityAutomationChecks', () => {
    it('should pass all checks with complete security workflow', () => {
      const content = [
        'name: Security',
        'jobs:',
        '  gitleaks:',
        '  codeql:',
        '  dependency-review:',
        '  trivy-fs:',
        '  trivy-iac:',
        '  - uses: aquasecurity/trivy-action@master',
      ].join('\n');
      const results = runSecurityAutomationChecks(content);
      const failures = results.filter((r) => !r.passed);
      expect(failures).toHaveLength(0);
    });

    it('should fail when gitleaks job missing', () => {
      const results = runSecurityAutomationChecks('no security content');
      expect(results.some((r) => r.name === 'security:gitleaks-job' && !r.passed)).toBe(true);
    });

    it('should fail when codeql job missing', () => {
      const results = runSecurityAutomationChecks('no security content');
      expect(results.some((r) => r.name === 'security:codeql-job' && !r.passed)).toBe(true);
    });

    it('should fail when trivy action missing', () => {
      const results = runSecurityAutomationChecks('no security content');
      expect(results.some((r) => r.name === 'security:trivy-action' && !r.passed)).toBe(true);
    });

    it('should compile report with failures for empty content', () => {
      const results = runSecurityAutomationChecks('');
      const report = compileQaReport(results);
      expect(report.failed).toBeGreaterThan(0);
    });

    it('should compile passing report for complete content', () => {
      const content =
        'gitleaks codeql dependency-review trivy-fs trivy-iac aquasecurity/trivy-action';
      const results = runSecurityAutomationChecks(content);
      const report = compileQaReport(results);
      expect(report.failed).toBe(0);
    });

    it('should format report with title', () => {
      const results = runSecurityAutomationChecks('');
      const report = compileQaReport(results);
      const output = formatQaReport(report, 'Security automation');
      expect(output).toContain('Security automation');
    });
  });

  describe('dropshipping scenarios', () => {
    it('should validate payment security automation', () => {
      const content =
        'gitleaks codeql dependency-review trivy-fs trivy-iac aquasecurity/trivy-action';
      const results = runSecurityAutomationChecks(content);
      const report = compileQaReport(results);
      expect(report.failed).toBe(0);
    });
  });
});
