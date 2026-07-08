import { describe, expect, it } from 'vitest';
import {
  analyzeDirectory,
  calculatePriority,
  createCoverageSummary,
  createGap,
  getReason,
  getTypeScriptFiles,
  hasTestFile,
  isValidTsFile,
} from './coverage-analyzer-logic.js';

describe('coverage-analyzer-logic', () => {
  describe('getTypeScriptFiles', () => {
    it('should be a function', () => {
      expect(typeof getTypeScriptFiles).toBe('function');
    });
  });
  describe('isValidTsFile', () => {
    it('should be a function', () => {
      expect(typeof isValidTsFile).toBe('function');
    });
  });
  describe('hasTestFile', () => {
    it('should be a function', () => {
      expect(typeof hasTestFile).toBe('function');
    });
  });
  describe('calculatePriority', () => {
    it('should be a function', () => {
      expect(typeof calculatePriority).toBe('function');
    });
  });
  describe('getReason', () => {
    it('should be a function', () => {
      expect(typeof getReason).toBe('function');
    });
  });
  describe('createGap', () => {
    it('should be a function', () => {
      expect(typeof createGap).toBe('function');
    });
  });
  describe('createCoverageSummary', () => {
    it('should be a function', () => {
      expect(typeof createCoverageSummary).toBe('function');
    });
  });
  describe('analyzeDirectory', () => {
    it('should be a function', () => {
      expect(typeof analyzeDirectory).toBe('function');
    });
  });
});
