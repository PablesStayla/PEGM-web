import { describe, expect, it } from 'vitest';
import type { Severity } from './define-secret-patterns.js';
import {
  IGNORE_PATTERNS,
  SECRET_PATTERNS,
  shouldIgnoreFile,
  sortBySeverity,
} from './define-secret-patterns.js';

describe('define-secret-patterns', () => {
  describe('SECRET_PATTERNS', () => {
    it('should re-export patterns from lib', () => {
      expect(SECRET_PATTERNS.length).toBeGreaterThan(0);
    });
  });

  describe('IGNORE_PATTERNS', () => {
    it('should re-export ignore patterns from lib', () => {
      expect(IGNORE_PATTERNS.length).toBeGreaterThan(0);
    });
  });

  describe('shouldIgnoreFile', () => {
    it('should ignore lock files', () => {
      expect(shouldIgnoreFile('package-lock.json')).toBe(true);
    });
  });

  describe('sortBySeverity', () => {
    it('should sort by severity', () => {
      const findings = [
        { severity: 'low' as const, file: 'a', line: 1, pattern: 'x' },
        { severity: 'critical' as const, file: 'b', line: 2, pattern: 'y' },
      ];
      const sorted = sortBySeverity(findings);
      expect(sorted[0].severity).toBe('critical');
    });
  });

  describe('Severity type', () => {
    it('should accept valid severity levels', () => {
      const levels: Severity[] = ['critical', 'high', 'medium', 'low'];
      expect(levels).toHaveLength(4);
    });
  });
});
