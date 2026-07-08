import { describe, expect, it } from 'vitest';
import {
  IGNORE_PATTERNS,
  SECRET_PATTERNS,
  shouldIgnoreFile,
  sortBySeverity,
} from '../lib/secret-patterns-logic.js';

describe('secret-patterns-logic', () => {
  describe('SECRET_PATTERNS', () => {
    it('should have patterns defined', () => {
      expect(SECRET_PATTERNS.length).toBeGreaterThan(0);
    });
    it('should each have name, pattern, and severity', () => {
      for (const p of SECRET_PATTERNS) {
        expect(p.name).toBeDefined();
        expect(p.pattern).toBeInstanceOf(RegExp);
        expect(['critical', 'high', 'medium', 'low']).toContain(p.severity);
      }
    });
  });

  describe('IGNORE_PATTERNS', () => {
    it('should have ignore patterns', () => {
      expect(IGNORE_PATTERNS.length).toBeGreaterThan(0);
    });
  });

  describe('shouldIgnoreFile', () => {
    it('should ignore lock files', () => {
      expect(shouldIgnoreFile('package-lock.json')).toBe(true);
    });
    it('should ignore node_modules', () => {
      expect(shouldIgnoreFile('node_modules/foo/index.js')).toBe(true);
    });
    it('should not ignore source files', () => {
      expect(shouldIgnoreFile('src/config.ts')).toBe(false);
    });
  });

  describe('sortBySeverity', () => {
    it('should sort critical first', () => {
      const findings = [
        { severity: 'low' as const, file: 'a', line: 1, pattern: 'x' },
        { severity: 'critical' as const, file: 'b', line: 2, pattern: 'y' },
        { severity: 'high' as const, file: 'c', line: 3, pattern: 'z' },
      ];
      const sorted = sortBySeverity(findings);
      expect(sorted[0].severity).toBe('critical');
    });
  });
});
