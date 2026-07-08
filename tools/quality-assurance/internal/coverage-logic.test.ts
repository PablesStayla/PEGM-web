import { describe, expect, it } from 'vitest';
import {
  CoverageEntry,
  CoverageFailure,
  CoverageTarget,
  CoverageThreshold,
  computeFunctions,
  computeStatements,
  percentage,
  toPosixPath,
} from './coverage-logic.js';

describe('coverage-logic', () => {
  describe('CoverageEntry', () => {
    it('should be a function', () => {
      expect(typeof CoverageEntry).toBe('function');
    });
  });
  describe('CoverageThreshold', () => {
    it('should be a function', () => {
      expect(typeof CoverageThreshold).toBe('function');
    });
  });
  describe('CoverageTarget', () => {
    it('should be a function', () => {
      expect(typeof CoverageTarget).toBe('function');
    });
  });
  describe('CoverageFailure', () => {
    it('should be a function', () => {
      expect(typeof CoverageFailure).toBe('function');
    });
  });
  describe('percentage', () => {
    it('should be a function', () => {
      expect(typeof percentage).toBe('function');
    });
  });
  describe('toPosixPath', () => {
    it('should be a function', () => {
      expect(typeof toPosixPath).toBe('function');
    });
  });
  describe('computeStatements', () => {
    it('should be a function', () => {
      expect(typeof computeStatements).toBe('function');
    });
  });
  describe('computeFunctions', () => {
    it('should be a function', () => {
      expect(typeof computeFunctions).toBe('function');
    });
  });
});
