import { describe, expect, it } from 'vitest';
import {
  checkEmptySections,
  checkNaming,
  checkRequiredSections,
  isStrictDoc,
  LintResult,
  NAMING_PATTERN,
  REQUIRED_SECTIONS,
  STRICT_DOC_PATTERNS,
} from './docs-lint-logic.js';

describe('docs-lint-logic', () => {
  describe('LintResult', () => {
    it('should be a function', () => {
      expect(typeof LintResult).toBe('function');
    });
  });
  describe('REQUIRED_SECTIONS', () => {
    it('should be a function', () => {
      expect(typeof REQUIRED_SECTIONS).toBe('function');
    });
  });
  describe('NAMING_PATTERN', () => {
    it('should be a function', () => {
      expect(typeof NAMING_PATTERN).toBe('function');
    });
  });
  describe('STRICT_DOC_PATTERNS', () => {
    it('should be a function', () => {
      expect(typeof STRICT_DOC_PATTERNS).toBe('function');
    });
  });
  describe('isStrictDoc', () => {
    it('should be a function', () => {
      expect(typeof isStrictDoc).toBe('function');
    });
  });
  describe('checkNaming', () => {
    it('should be a function', () => {
      expect(typeof checkNaming).toBe('function');
    });
  });
  describe('checkRequiredSections', () => {
    it('should be a function', () => {
      expect(typeof checkRequiredSections).toBe('function');
    });
  });
  describe('checkEmptySections', () => {
    it('should be a function', () => {
      expect(typeof checkEmptySections).toBe('function');
    });
  });
});
