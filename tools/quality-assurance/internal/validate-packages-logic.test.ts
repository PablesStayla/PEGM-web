import { describe, expect, it } from 'vitest';
import {
  compilePackageValidation,
  PackageValidationResult,
  RECOMMENDED_FIELDS,
  REQUIRED_FIELDS,
  validateExportPaths,
  validateRecommendedFields,
  validateRequiredFields,
} from './validate-packages-logic.js';

describe('validate-packages-logic', () => {
  describe('PackageValidationResult', () => {
    it('should be a function', () => {
      expect(typeof PackageValidationResult).toBe('function');
    });
  });
  describe('REQUIRED_FIELDS', () => {
    it('should be a function', () => {
      expect(typeof REQUIRED_FIELDS).toBe('function');
    });
  });
  describe('RECOMMENDED_FIELDS', () => {
    it('should be a function', () => {
      expect(typeof RECOMMENDED_FIELDS).toBe('function');
    });
  });
  describe('validateRequiredFields', () => {
    it('should be a function', () => {
      expect(typeof validateRequiredFields).toBe('function');
    });
  });
  describe('validateRecommendedFields', () => {
    it('should be a function', () => {
      expect(typeof validateRecommendedFields).toBe('function');
    });
  });
  describe('validateExportPaths', () => {
    it('should be a function', () => {
      expect(typeof validateExportPaths).toBe('function');
    });
  });
  describe('compilePackageValidation', () => {
    it('should be a function', () => {
      expect(typeof compilePackageValidation).toBe('function');
    });
  });
});
