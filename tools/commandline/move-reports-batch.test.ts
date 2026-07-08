import { describe, expect, it } from 'vitest';
import {
  patternToRegex,
  REPORT_PATTERNS,
  shouldMoveFile,
  TARGET_DIR,
} from './move-reports-batch.js';

describe('move-reports-batch', () => {
  describe('REPORT_PATTERNS', () => {
    it('should have patterns defined', () => {
      expect(REPORT_PATTERNS.length).toBeGreaterThan(0);
    });
  });

  describe('TARGET_DIR', () => {
    it('should be a valid path', () => {
      expect(TARGET_DIR).toContain('docs');
    });
  });

  describe('patternToRegex', () => {
    it('should convert glob to regex', () => {
      const regex = patternToRegex('FINAL_*.md');
      expect(regex.test('FINAL_REPORT.md')).toBe(true);
      expect(regex.test('other.md')).toBe(false);
    });
    it('should match exact filenames', () => {
      const regex = patternToRegex('findings.md');
      expect(regex.test('findings.md')).toBe(true);
    });
  });

  describe('shouldMoveFile', () => {
    it('should match report filenames', () => {
      expect(shouldMoveFile('FINAL_REPORT.md')).toBe(true);
    });
    it('should not match non-report files', () => {
      expect(shouldMoveFile('index.ts')).toBe(false);
    });
  });
});
