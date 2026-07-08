import { describe, expect, it } from 'vitest';
import {
  ArchFinding,
  checkForbiddenImports,
  checkGigantism,
  DEFAULT_GIGANTISM_CONFIG,
  FORBIDDEN_IMPORT_RULES,
  ForbiddenImportRule,
  GigantismConfig,
  shouldSkipFile,
} from './architecture-logic.js';

describe('architecture-logic', () => {
  describe('ArchFinding', () => {
    it('should be a function', () => {
      expect(typeof ArchFinding).toBe('function');
    });
  });
  describe('GigantismConfig', () => {
    it('should be a function', () => {
      expect(typeof GigantismConfig).toBe('function');
    });
  });
  describe('DEFAULT_GIGANTISM_CONFIG', () => {
    it('should be a function', () => {
      expect(typeof DEFAULT_GIGANTISM_CONFIG).toBe('function');
    });
  });
  describe('ForbiddenImportRule', () => {
    it('should be a function', () => {
      expect(typeof ForbiddenImportRule).toBe('function');
    });
  });
  describe('FORBIDDEN_IMPORT_RULES', () => {
    it('should be a function', () => {
      expect(typeof FORBIDDEN_IMPORT_RULES).toBe('function');
    });
  });
  describe('shouldSkipFile', () => {
    it('should be a function', () => {
      expect(typeof shouldSkipFile).toBe('function');
    });
  });
  describe('checkGigantism', () => {
    it('should be a function', () => {
      expect(typeof checkGigantism).toBe('function');
    });
  });
  describe('checkForbiddenImports', () => {
    it('should be a function', () => {
      expect(typeof checkForbiddenImports).toBe('function');
    });
  });
});
