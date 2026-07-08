import { describe, expect, it } from 'vitest';
import {
  calculateDailyAvg,
  classifyPerformance,
  computeDoraReport,
  formatDoraReport,
} from './internal/dora-logic.js';

describe('dora-logic', () => {
  describe('calculateDailyAvg', () => {
    it('should divide by 7', () => {
      expect(calculateDailyAvg(14)).toBe(2);
    });

    it('should handle zero commits', () => {
      expect(calculateDailyAvg(0)).toBe(0);
    });

    it('should handle fractional result', () => {
      expect(calculateDailyAvg(3)).toBeCloseTo(0.4286, 3);
    });
  });

  describe('classifyPerformance', () => {
    it('should return elite for >2 deploys/day', () => {
      expect(classifyPerformance(3)).toBe('elite');
    });

    it('should return high for >1 deploy/day', () => {
      expect(classifyPerformance(1.5)).toBe('high');
    });

    it('should return medium for >0.5 deploys/day', () => {
      expect(classifyPerformance(0.7)).toBe('medium');
    });

    it('should return low for <=0.5 deploys/day', () => {
      expect(classifyPerformance(0.3)).toBe('low');
    });

    it('should return low for zero', () => {
      expect(classifyPerformance(0)).toBe('low');
    });
  });

  describe('computeDoraReport', () => {
    it('should compute report from valid input', () => {
      const result = computeDoraReport({
        totalCommits: 100,
        last7Days: 21,
        leadTimeHours: 1.2,
        changeFailureRate: 0,
        mttrMinutes: 15,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metrics.dailyAvg).toBe(3);
        expect(result.data.performanceLevel).toBe('elite');
      }
    });

    it('should fail for negative change failure rate', () => {
      const result = computeDoraReport({
        totalCommits: 10,
        last7Days: 7,
        leadTimeHours: 1,
        changeFailureRate: -1,
        mttrMinutes: 15,
      });

      expect(result.success).toBe(false);
    });

    it('should fail for invalid input type', () => {
      const result = computeDoraReport('invalid');

      expect(result.success).toBe(false);
    });

    it('should fail for missing fields', () => {
      const result = computeDoraReport({ totalCommits: 10 });

      expect(result.success).toBe(false);
    });
  });

  describe('formatDoraReport', () => {
    it('should include all metrics in output', () => {
      const report = {
        metrics: {
          deploymentFrequency: 100,
          dailyAvg: 3,
          leadTimeHours: 1.2,
          changeFailureRate: 0,
          mttrMinutes: 15,
        },
        performanceLevel: 'elite' as const,
      };

      const output = formatDoraReport(report);

      expect(output).toContain('3.00');
      expect(output).toContain('1.2h');
      expect(output).toContain('ELITE');
    });
  });

  describe('dropshipping scenarios', () => {
    it('should handle zero deployments gracefully', () => {
      const result = computeDoraReport({
        totalCommits: 0,
        last7Days: 0,
        leadTimeHours: 0,
        changeFailureRate: 0,
        mttrMinutes: 0,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.performanceLevel).toBe('low');
      }
    });

    it('should handle high change failure rate', () => {
      const result = computeDoraReport({
        totalCommits: 50,
        last7Days: 14,
        leadTimeHours: 24,
        changeFailureRate: 45,
        mttrMinutes: 60,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metrics.changeFailureRate).toBe(45);
      }
    });

    it('should reject change failure rate > 100', () => {
      const result = computeDoraReport({
        totalCommits: 10,
        last7Days: 7,
        leadTimeHours: 1,
        changeFailureRate: 150,
        mttrMinutes: 15,
      });

      expect(result.success).toBe(false);
    });
  });
});
