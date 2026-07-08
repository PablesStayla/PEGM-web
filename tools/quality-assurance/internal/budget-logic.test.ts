import { describe, expect, it } from 'vitest';
import {
  BudgetCheckResult,
  BudgetThreshold,
  BudgetThresholdSchema,
  checkBudget,
  DEFAULT_BUDGETS,
  formatBudgetReport,
  validateBudgets,
} from './budget-logic.js';

describe('budget-logic', () => {
  describe('BudgetThreshold', () => {
    it('should be a function', () => {
      expect(typeof BudgetThreshold).toBe('function');
    });
  });
  describe('BudgetCheckResult', () => {
    it('should be a function', () => {
      expect(typeof BudgetCheckResult).toBe('function');
    });
  });
  describe('BudgetThresholdSchema', () => {
    it('should be a function', () => {
      expect(typeof BudgetThresholdSchema).toBe('function');
    });
  });
  describe('DEFAULT_BUDGETS', () => {
    it('should be a function', () => {
      expect(typeof DEFAULT_BUDGETS).toBe('function');
    });
  });
  describe('checkBudget', () => {
    it('should be a function', () => {
      expect(typeof checkBudget).toBe('function');
    });
  });
  describe('validateBudgets', () => {
    it('should be a function', () => {
      expect(typeof validateBudgets).toBe('function');
    });
  });
  describe('formatBudgetReport', () => {
    it('should be a function', () => {
      expect(typeof formatBudgetReport).toBe('function');
    });
  });
});
