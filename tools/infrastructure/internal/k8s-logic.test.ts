import { describe, expect, it } from 'vitest';
import {
  checkFileContains,
  checkFileExists,
  compileK8sReport,
  FileChecker,
  FileReader,
  formatK8sReport,
  runAllChecks,
} from './k8s-logic.js';

describe('k8s-logic', () => {
  describe('FileChecker', () => {
    it('should be a function', () => {
      expect(typeof FileChecker).toBe('function');
    });
  });
  describe('FileReader', () => {
    it('should be a function', () => {
      expect(typeof FileReader).toBe('function');
    });
  });
  describe('checkFileExists', () => {
    it('should be a function', () => {
      expect(typeof checkFileExists).toBe('function');
    });
  });
  describe('checkFileContains', () => {
    it('should be a function', () => {
      expect(typeof checkFileContains).toBe('function');
    });
  });
  describe('runAllChecks', () => {
    it('should be a function', () => {
      expect(typeof runAllChecks).toBe('function');
    });
  });
  describe('compileK8sReport', () => {
    it('should be a function', () => {
      expect(typeof compileK8sReport).toBe('function');
    });
  });
  describe('formatK8sReport', () => {
    it('should be a function', () => {
      expect(typeof formatK8sReport).toBe('function');
    });
  });
});
