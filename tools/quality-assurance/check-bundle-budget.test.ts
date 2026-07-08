import { describe, expect, it } from 'vitest';
import {
  checkBudget,
  DEFAULT_BUDGETS,
  formatBudgetReport,
  validateBudgets,
} from './internal/budget-logic.js';

describe('budget-logic', () => {
  describe('checkBudget', () => {
    it('should pass when within budget', () => {
      const result = checkBudget(300, 100, { maxTotalSizeKB: 500, maxFirstLoadKB: 150 });
      expect(result.withinBudget).toBe(true);
    });

    it('should fail when total exceeds budget', () => {
      const result = checkBudget(600, 100, { maxTotalSizeKB: 500, maxFirstLoadKB: 150 });
      expect(result.withinBudget).toBe(false);
    });

    it('should fail when first load exceeds budget', () => {
      const result = checkBudget(300, 200, { maxTotalSizeKB: 500, maxFirstLoadKB: 150 });
      expect(result.withinBudget).toBe(false);
    });
  });

  describe('validateBudgets', () => {
    it('should validate all apps', () => {
      const results = validateBudgets(
        {
          web: { totalSizeKB: 300, firstLoadKB: 100 },
          admin: { totalSizeKB: 800, firstLoadKB: 200 },
        },
        DEFAULT_BUDGETS,
      );
      expect(results).toHaveLength(2);
    });

    it('should skip apps without budget', () => {
      const results = validateBudgets(
        { unknown: { totalSizeKB: 100, firstLoadKB: 50 } },
        DEFAULT_BUDGETS,
      );
      expect(results).toHaveLength(0);
    });
  });

  describe('formatBudgetReport', () => {
    it('should show pass when all within budget', () => {
      const results = [{ app: 'web', withinBudget: true, totalSizeKB: 300, firstLoadKB: 100 }];
      expect(formatBudgetReport(results)).toContain('within performance budget');
    });

    it('should show fail when any exceeds budget', () => {
      const results = [{ app: 'web', withinBudget: false, totalSizeKB: 600, firstLoadKB: 100 }];
      expect(formatBudgetReport(results)).toContain('exceeded');
    });
  });

  describe('dropshipping scenarios', () => {
    it('should handle zero-size bundles', () => {
      const result = checkBudget(0, 0, { maxTotalSizeKB: 500, maxFirstLoadKB: 150 });
      expect(result.withinBudget).toBe(true);
    });

    it('should handle vendor chunk sizes', () => {
      const result = checkBudget(499, 149, DEFAULT_BUDGETS.web);
      expect(result.withinBudget).toBe(true);
    });
  });
});
