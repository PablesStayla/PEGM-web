import { describe, expect, it } from 'vitest';
import type { CoverageEntry, CoverageTarget } from './internal/coverage-logic.js';
import {
  findCoverageEntry,
  formatCoverageResult,
  percentage,
  runCoverageGate,
} from './internal/coverage-logic.js';

const CORE_TARGETS: readonly CoverageTarget[] = [
  {
    fileSuffix: 'checkout.service.ts',
    threshold: { statements: 90, functions: 100, branches: 80 },
  },
  {
    fileSuffix: 'product.service.ts',
    threshold: { statements: 90, functions: 100, branches: 70 },
  },
  {
    fileSuffix: 'cart.service.ts',
    threshold: { statements: 90, functions: 100, branches: 70 },
  },
];

function makeFullCoverageEntry(path: string): CoverageEntry {
  return { path, s: { '0': 1, '1': 1 }, f: { '0': 1 }, b: { '0': [1, 1] } };
}

function makePartialCoverageEntry(path: string): CoverageEntry {
  return {
    path,
    s: { '0': 1, '1': 0, '2': 0, '3': 0, '4': 0 },
    f: { '0': 1, '1': 0 },
    b: { '0': [1, 0], '1': [0, 0] },
  };
}

describe('critical-coverage-check', () => {
  const fullMap: Record<string, CoverageEntry> = {
    'packages/core-domain/src/application/checkout/checkout.service.ts': makeFullCoverageEntry(
      'packages/core-domain/src/application/checkout/checkout.service.ts',
    ),
    'packages/core-domain/src/application/catalog/product.service.ts': makeFullCoverageEntry(
      'packages/core-domain/src/application/catalog/product.service.ts',
    ),
    'packages/core-domain/src/application/cart/cart.service.ts': makeFullCoverageEntry(
      'packages/core-domain/src/application/cart/cart.service.ts',
    ),
  };

  const partialMap: Record<string, CoverageEntry> = {
    'packages/core-domain/src/application/checkout/checkout.service.ts': makePartialCoverageEntry(
      'packages/core-domain/src/application/checkout/checkout.service.ts',
    ),
    'packages/core-domain/src/application/catalog/product.service.ts': makePartialCoverageEntry(
      'packages/core-domain/src/application/catalog/product.service.ts',
    ),
    'packages/core-domain/src/application/cart/cart.service.ts': makePartialCoverageEntry(
      'packages/core-domain/src/application/cart/cart.service.ts',
    ),
  };

  describe('core domain targets', () => {
    it('should pass when all thresholds met', () => {
      const failures = runCoverageGate(fullMap, CORE_TARGETS);
      expect(failures).toHaveLength(0);
    });

    it('should fail when statements below threshold', () => {
      const failures = runCoverageGate(partialMap, CORE_TARGETS);
      expect(failures.some((f) => f.metric === 'statements')).toBe(true);
    });

    it('should find entry by file suffix', () => {
      const entry = findCoverageEntry(fullMap, 'checkout.service.ts');
      expect(entry).not.toBeNull();
    });

    it('should return null for missing entry', () => {
      const entry = findCoverageEntry({}, 'nonexistent.ts');
      expect(entry).toBeNull();
    });

    it('should format coverage result for passing target', () => {
      const entry = findCoverageEntry(fullMap, 'checkout.service.ts');
      const output = formatCoverageResult(CORE_TARGETS[0], entry);
      expect(output).toContain('statements=');
    });

    it('should require 100% functions for checkout', () => {
      expect(CORE_TARGETS[0].threshold.functions).toBe(100);
    });

    it('should require 90% statements for all core targets', () => {
      expect(CORE_TARGETS.every((t) => t.threshold.statements === 90)).toBe(true);
    });
  });

  describe('percentage helper', () => {
    it('should calculate percentage correctly', () => {
      expect(percentage(75, 100)).toBe(75);
    });

    it('should return 100 for zero total', () => {
      expect(percentage(0, 0)).toBe(100);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should validate checkout coverage for payment flows', () => {
      const failures = runCoverageGate(fullMap, CORE_TARGETS);
      expect(failures).toHaveLength(0);
    });
  });
});
