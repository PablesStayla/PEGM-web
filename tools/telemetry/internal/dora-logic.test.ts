import { describe, expect, it } from 'vitest';
import {
  calculateDailyAvg,
  classifyPerformance,
  computeDoraReport,
  formatDoraReport,
} from './dora-logic.js';

describe('dora-logic', () => {
  describe('calculateDailyAvg', () => {
    it('should be a function', () => {
      expect(typeof calculateDailyAvg).toBe('function');
    });
  });
  describe('classifyPerformance', () => {
    it('should be a function', () => {
      expect(typeof classifyPerformance).toBe('function');
    });
  });
  describe('computeDoraReport', () => {
    it('should be a function', () => {
      expect(typeof computeDoraReport).toBe('function');
    });
  });
  describe('formatDoraReport', () => {
    it('should be a function', () => {
      expect(typeof formatDoraReport).toBe('function');
    });
  });
});
