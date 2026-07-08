import { describe, expect, it } from 'vitest';
import {
  AuditCheck,
  AuditResult,
  calculateScore,
  checkFiles,
  checkPackageStructure,
  checkScripts,
  REQUIRED_FILES,
  REQUIRED_SCRIPTS,
} from './audit-packages-logic.js';

describe('audit-packages-logic', () => {
  describe('AuditCheck', () => {
    it('should be a function', () => {
      expect(typeof AuditCheck).toBe('function');
    });
  });
  describe('AuditResult', () => {
    it('should be a function', () => {
      expect(typeof AuditResult).toBe('function');
    });
  });
  describe('REQUIRED_SCRIPTS', () => {
    it('should be a function', () => {
      expect(typeof REQUIRED_SCRIPTS).toBe('function');
    });
  });
  describe('REQUIRED_FILES', () => {
    it('should be a function', () => {
      expect(typeof REQUIRED_FILES).toBe('function');
    });
  });
  describe('checkPackageStructure', () => {
    it('should be a function', () => {
      expect(typeof checkPackageStructure).toBe('function');
    });
  });
  describe('checkScripts', () => {
    it('should be a function', () => {
      expect(typeof checkScripts).toBe('function');
    });
  });
  describe('checkFiles', () => {
    it('should be a function', () => {
      expect(typeof checkFiles).toBe('function');
    });
  });
  describe('calculateScore', () => {
    it('should be a function', () => {
      expect(typeof calculateScore).toBe('function');
    });
  });
});
