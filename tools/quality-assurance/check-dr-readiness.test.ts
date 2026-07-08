import { describe, expect, it } from 'vitest';
import { checkScript, REQUIRED_DR_FILES, REQUIRED_DR_SCRIPTS } from './internal/dr-drill-logic.js';

describe('check-dr-readiness (shell + core)', () => {
  it('should have required DR files defined', () => {
    expect(REQUIRED_DR_FILES.length).toBeGreaterThan(0);
  });

  it('should have required DR scripts defined', () => {
    expect(REQUIRED_DR_SCRIPTS.length).toBeGreaterThan(0);
  });

  it('should check script presence', () => {
    const result = checkScript('backup', true);
    expect(result.passed).toBe(true);
  });

  it('should fail for missing script', () => {
    const result = checkScript('backup', false);
    expect(result.passed).toBe(false);
  });
});
