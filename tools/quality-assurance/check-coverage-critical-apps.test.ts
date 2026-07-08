import { describe, expect, it } from 'vitest';
import type { CoverageEntry, CoverageTarget } from './internal/coverage-logic.js';
import {
  findCoverageEntry,
  formatCoverageResult,
  runCoverageGate,
} from './internal/coverage-logic.js';

const APPS_TARGETS: readonly CoverageTarget[] = [
  {
    fileSuffix: 'actions/checkout.ts',
    threshold: { statements: 70, functions: 70, branches: 60 },
  },
  {
    fileSuffix: 'api/chat/route.ts',
    threshold: { statements: 85, functions: 100, branches: 80 },
  },
  {
    fileSuffix: 'api/coupons/route.ts',
    threshold: { statements: 90, functions: 100, branches: 80 },
  },
  {
    fileSuffix: 'security-headers.ts',
    threshold: { statements: 100, functions: 100, branches: 100 },
  },
];

function makeFullCoverageEntry(path: string): CoverageEntry {
  return { path, s: { '0': 1, '1': 1 }, f: { '0': 1 }, b: { '0': [1, 1] } };
}

function makePartialCoverageEntry(path: string): CoverageEntry {
  return { path, s: { '0': 1, '1': 0 }, f: { '0': 1 }, b: { '0': [1, 0] } };
}

describe('apps-critical-coverage-check', () => {
  const fullMap: Record<string, CoverageEntry> = {
    'apps/web/src/app/[locale]/actions/checkout.ts': makeFullCoverageEntry(
      'apps/web/src/app/[locale]/actions/checkout.ts',
    ),
    'apps/web/src/app/api/chat/route.ts': makeFullCoverageEntry(
      'apps/web/src/app/api/chat/route.ts',
    ),
    'apps/web/src/app/api/coupons/route.ts': makeFullCoverageEntry(
      'apps/web/src/app/api/coupons/route.ts',
    ),
    'apps/web/src/middleware/security-headers.ts': makeFullCoverageEntry(
      'apps/web/src/middleware/security-headers.ts',
    ),
  };

  const partialMap: Record<string, CoverageEntry> = {
    'apps/web/src/app/[locale]/actions/checkout.ts': makePartialCoverageEntry(
      'apps/web/src/app/[locale]/actions/checkout.ts',
    ),
    'apps/web/src/app/api/chat/route.ts': makePartialCoverageEntry(
      'apps/web/src/app/api/chat/route.ts',
    ),
    'apps/web/src/app/api/coupons/route.ts': makePartialCoverageEntry(
      'apps/web/src/app/api/coupons/route.ts',
    ),
    'apps/web/src/middleware/security-headers.ts': makePartialCoverageEntry(
      'apps/web/src/middleware/security-headers.ts',
    ),
  };

  describe('apps targets', () => {
    it('should pass when all thresholds met', () => {
      const failures = runCoverageGate(fullMap, APPS_TARGETS);
      expect(failures).toHaveLength(0);
    });

    it('should fail when security-headers below 100%', () => {
      const failures = runCoverageGate(partialMap, APPS_TARGETS);
      const secFailures = failures.filter((f) => f.target.includes('security-headers'));
      expect(secFailures.length).toBeGreaterThan(0);
    });

    it('should find entry by file suffix', () => {
      const entry = findCoverageEntry(fullMap, 'security-headers.ts');
      expect(entry).not.toBeNull();
    });

    it('should require 100% for security-headers', () => {
      const secTarget = APPS_TARGETS.find((t) => t.fileSuffix.includes('security-headers'));
      expect(secTarget?.threshold.statements).toBe(100);
      expect(secTarget?.threshold.functions).toBe(100);
      expect(secTarget?.threshold.branches).toBe(100);
    });

    it('should require 70% statements for checkout actions', () => {
      const checkoutTarget = APPS_TARGETS.find((t) => t.fileSuffix.includes('actions/checkout'));
      expect(checkoutTarget?.threshold.statements).toBe(70);
    });

    it('should require 90% statements for coupons route', () => {
      const couponsTarget = APPS_TARGETS.find((t) => t.fileSuffix.includes('coupons'));
      expect(couponsTarget?.threshold.statements).toBe(90);
    });

    it('should format coverage result', () => {
      const entry = findCoverageEntry(fullMap, 'security-headers.ts');
      const output = formatCoverageResult(APPS_TARGETS[3], entry);
      expect(output).toContain('statements=');
    });
  });

  describe('dropshipping scenarios', () => {
    it('should validate checkout actions coverage for payment', () => {
      const failures = runCoverageGate(fullMap, APPS_TARGETS);
      expect(failures).toHaveLength(0);
    });
  });
});
