import { describe, expect, it } from 'vitest';
import { compileStaffResults } from './internal/staff-audit-logic.js';

describe('audit-staff-readiness (shell + core)', () => {
  it('should compile staff audit results', () => {
    const results = [
      { category: 'lint', passed: true, message: 'OK' },
      { category: 'typecheck', passed: true, message: 'OK' },
    ];
    const summary = compileStaffResults(results as any);
    expect(summary.total).toBe(2);
    expect(summary.passed).toBe(2);
  });

  it('should count failures', () => {
    const results = [
      { category: 'lint', passed: true, message: 'OK' },
      { category: 'typecheck', passed: false, message: 'Errors found' },
    ];
    const summary = compileStaffResults(results as any);
    expect(summary.failed).toBe(1);
  });
});
