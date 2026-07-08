import { describe, expect, it } from 'vitest';
import {
  getCheckByName,
  getCheckNames,
  getCriticalChecks,
  getNonCriticalChecks,
  VALIDATION_CHECKS,
} from './check-validation-rules.js';

describe('check-validation-rules', () => {
  describe('VALIDATION_CHECKS', () => {
    it('should have checks defined', () => {
      expect(VALIDATION_CHECKS.length).toBeGreaterThan(0);
    });
    it('should each have name and command', () => {
      for (const check of VALIDATION_CHECKS) {
        expect(check.name).toBeTruthy();
        expect(check.command).toBeTruthy();
      }
    });
  });

  describe('getCriticalChecks', () => {
    it('should return only critical checks', () => {
      const result = getCriticalChecks();
      expect(result.every((c) => c.critical)).toBe(true);
    });
  });

  describe('getNonCriticalChecks', () => {
    it('should return only non-critical checks', () => {
      const result = getNonCriticalChecks();
      expect(result.every((c) => !c.critical)).toBe(true);
    });
  });

  describe('getCheckByName', () => {
    it('should find existing check', () => {
      if (VALIDATION_CHECKS.length > 0) {
        const name = VALIDATION_CHECKS[0].name;
        const result = getCheckByName(name);
        expect(result).toBeDefined();
      }
    });
    it('should return undefined for unknown check', () => {
      const result = getCheckByName('nonexistent-check-xyz');
      expect(result).toBeUndefined();
    });
  });

  describe('getCheckNames', () => {
    it('should return all check names', () => {
      const names = getCheckNames();
      expect(names.length).toBe(VALIDATION_CHECKS.length);
    });
  });
});
