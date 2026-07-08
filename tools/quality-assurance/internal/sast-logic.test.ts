import { describe, expect, it } from 'vitest';
import {
  formatSastReport,
  SAST_PATTERNS,
  SastFinding,
  SastPattern,
  SastPatternConfigSchema,
  scanContent,
  scanLine,
} from './sast-logic.js';

describe('sast-logic', () => {
  describe('SastPattern', () => {
    it('should be a function', () => {
      expect(typeof SastPattern).toBe('function');
    });
  });
  describe('SAST_PATTERNS', () => {
    it('should be a function', () => {
      expect(typeof SAST_PATTERNS).toBe('function');
    });
  });
  describe('SastPatternConfigSchema', () => {
    it('should be a function', () => {
      expect(typeof SastPatternConfigSchema).toBe('function');
    });
  });
  describe('SastFinding', () => {
    it('should be a function', () => {
      expect(typeof SastFinding).toBe('function');
    });
  });
  describe('scanLine', () => {
    it('should be a function', () => {
      expect(typeof scanLine).toBe('function');
    });
  });
  describe('scanContent', () => {
    it('should be a function', () => {
      expect(typeof scanContent).toBe('function');
    });
  });
  describe('formatSastReport', () => {
    it('should be a function', () => {
      expect(typeof formatSastReport).toBe('function');
    });
  });
});
