import { describe, expect, it } from 'vitest';
import {
  analyzeDirectory,
  calculatePriority,
  createCoverageSummary,
  getReason,
  hasTestFile,
  isValidTsFile,
} from './internal/coverage-analyzer-logic.js';

describe('coverage-analyzer-logic', () => {
  describe('isValidTsFile', () => {
    it('should accept regular .ts files', () => {
      expect(isValidTsFile('service.ts')).toBe(true);
    });

    it('should reject test files', () => {
      expect(isValidTsFile('service.test.ts')).toBe(false);
      expect(isValidTsFile('service.spec.ts')).toBe(false);
    });

    it('should reject declaration files', () => {
      expect(isValidTsFile('index.d.ts')).toBe(false);
    });

    it('should reject non-ts files', () => {
      expect(isValidTsFile('readme.md')).toBe(false);
    });
  });

  describe('hasTestFile', () => {
    it('should return false for files without tests', () => {
      expect(hasTestFile('/nonexistent/path/service.ts')).toBe(false);
    });
  });

  describe('calculatePriority', () => {
    it('should assign critical for payment files', () => {
      expect(calculatePriority('/src/payment/service.ts')).toBe('critical');
    });

    it('should assign critical for domain entities', () => {
      expect(calculatePriority('/src/domain/entity.ts')).toBe('critical');
    });

    it('should assign high for middleware', () => {
      expect(calculatePriority('/src/middleware/auth.ts')).toBe('high');
    });

    it('should assign medium for adapters', () => {
      expect(calculatePriority('/src/adapter/api.ts')).toBe('medium');
    });

    it('should assign low for other files', () => {
      expect(calculatePriority('/src/utils/helper.ts')).toBe('low');
    });

    it('should assign critical for checkout files', () => {
      expect(calculatePriority('/src/checkout/handler.ts')).toBe('critical');
    });
  });

  describe('getReason', () => {
    it('should return core-domain reason', () => {
      expect(getReason('/src/domain/x.ts', 'core-domain')).toContain('Core business logic');
    });

    it('should return auth reason', () => {
      expect(getReason('/src/auth/x.ts', 'auth')).toContain('Authentication');
    });

    it('should return lib reason', () => {
      expect(getReason('/src/lib/utils.ts', 'web/lib')).toContain('Shared utilities');
    });

    it('should return default reason', () => {
      expect(getReason('/src/x.ts', 'other')).toContain('No test coverage');
    });
  });

  describe('createCoverageSummary', () => {
    it('should count gaps by priority', () => {
      const gaps = [
        { file: 'a.ts', priority: 'critical' as const, reason: 'test' },
        { file: 'b.ts', priority: 'high' as const, reason: 'test' },
        { file: 'c.ts', priority: 'low' as const, reason: 'test' },
      ];
      const summary = createCoverageSummary(gaps);
      expect(summary.critical).toBe(1);
      expect(summary.high).toBe(1);
      expect(summary.low).toBe(1);
      expect(summary.total).toBe(3);
    });

    it('should handle empty gaps', () => {
      const summary = createCoverageSummary([]);
      expect(summary.total).toBe(0);
    });
  });

  describe('analyzeDirectory', () => {
    it('should return empty for nonexistent directory', () => {
      const gaps = analyzeDirectory('/nonexistent/path', 'test', '/root');
      expect(gaps.length).toBe(0);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should prioritize order-related files as critical', () => {
      expect(calculatePriority('/src/order/service.ts')).toBe('critical');
    });

    it('should prioritize repository files as critical', () => {
      expect(calculatePriority('/src/repository/product.ts')).toBe('critical');
    });

    it('should prioritize checkout flow as critical', () => {
      expect(calculatePriority('/src/checkout/process.ts')).toBe('critical');
    });

    it('should prioritize application layer as high', () => {
      expect(calculatePriority('/src/application/use-case.ts')).toBe('high');
    });
  });
});
