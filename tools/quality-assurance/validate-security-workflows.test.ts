import { describe, expect, it } from 'vitest';
import { validateWorkflows } from './internal/security-workflows-logic.js';

describe('validate-security-workflows (shell + core)', () => {
  it('should validate security workflows', () => {
    const workflows = [
      { name: 'dependency-review', enabled: true, rules: [] },
      { name: 'code-scanning', enabled: true, rules: [] },
    ];
    const result = validateWorkflows(workflows as any);
    expect(result).toBeDefined();
  });

  it('should flag disabled workflows', () => {
    const workflows = [{ name: 'dependency-review', enabled: false, rules: [] }];
    const result = validateWorkflows(workflows as any);
    expect(result.some((r: any) => !r.passed)).toBe(true);
  });
});
