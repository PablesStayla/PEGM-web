import { describe, expect, it } from 'vitest';
import { compileTriageReport, prioritizeRemediation } from './internal/security-triage-logic.js';

describe('triage-security-vulnerabilities (shell + core)', () => {
  it('should prioritize remediation by severity', () => {
    const vulns = [
      { id: 1, severity: 'low', package: 'a' },
      { id: 2, severity: 'critical', package: 'b' },
      { id: 3, severity: 'high', package: 'c' },
    ];
    const result = prioritizeRemediation(vulns as any);
    expect(result[0].severity).toBe('critical');
  });

  it('should compile triage report', () => {
    const report = compileTriageReport([] as any);
    expect(report).toBeDefined();
  });
});
