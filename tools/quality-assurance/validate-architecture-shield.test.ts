import { describe, expect, it } from 'vitest';
import {
  analyzeFile,
  checkForbiddenImports,
  checkGigantism,
  DEFAULT_GIGANTISM_CONFIG,
  FORBIDDEN_IMPORT_RULES,
  shouldSkipFile,
} from './internal/architecture-logic.js';

describe('architecture-logic', () => {
  describe('shouldSkipFile', () => {
    it('should skip JSON files', () => {
      expect(shouldSkipFile('/src/data.json', '.json')).toBe(true);
    });

    it('should skip markdown files', () => {
      expect(shouldSkipFile('/src/README.md', '.md')).toBe(true);
    });

    it('should skip test files', () => {
      expect(shouldSkipFile('/src/foo.test.ts', '.ts')).toBe(true);
    });

    it('should skip migration files', () => {
      expect(shouldSkipFile('/src/migrations/001.ts', '.ts')).toBe(true);
    });

    it('should skip files outside src', () => {
      expect(shouldSkipFile('/tools/script.ts', '.ts')).toBe(true);
    });

    it('should process src TypeScript files', () => {
      expect(shouldSkipFile('/src/service.ts', '.ts')).toBe(false);
    });
  });

  describe('checkGigantism', () => {
    it('should flag files over max lines as critical', () => {
      const findings = checkGigantism(250, 'src/big.ts', DEFAULT_GIGANTISM_CONFIG);
      expect(findings).toHaveLength(1);
      expect(findings[0].type).toBe('CRITICAL');
    });

    it('should warn for files between target and max lines', () => {
      const findings = checkGigantism(150, 'src/medium.ts', DEFAULT_GIGANTISM_CONFIG);
      expect(findings).toHaveLength(1);
      expect(findings[0].type).toBe('WARNING');
    });

    it('should pass for files under target', () => {
      const findings = checkGigantism(80, 'src/small.ts', DEFAULT_GIGANTISM_CONFIG);
      expect(findings).toHaveLength(0);
    });
  });

  describe('checkForbiddenImports', () => {
    it('should detect forbidden @pranakaia/web import in core package', () => {
      const lines = ["import { x } from '@pranakaia/web';"];
      const findings = checkForbiddenImports(
        lines,
        'packages/core/src/index.ts',
        FORBIDDEN_IMPORT_RULES,
      );
      expect(findings).toHaveLength(1);
      expect(findings[0].type).toBe('FORBIDDEN_IMPORT');
    });

    it('should allow @pranakaia/web import in apps', () => {
      const lines = ["import { x } from '@pranakaia/web';"];
      const findings = checkForbiddenImports(
        lines,
        'apps/web/src/index.ts',
        FORBIDDEN_IMPORT_RULES,
      );
      expect(findings).toHaveLength(0);
    });

    it('should detect relative app imports in packages', () => {
      const lines = ["import { x } from '../../apps/web/src';"];
      const findings = checkForbiddenImports(
        lines,
        'packages/ui/src/component.ts',
        FORBIDDEN_IMPORT_RULES,
      );
      expect(findings).toHaveLength(1);
    });
  });

  describe('analyzeFile', () => {
    it('should combine gigantism and import findings', () => {
      const content = Array(250).fill("import { x } from '@pranakaia/web';").join('\n');
      const findings = analyzeFile(
        content,
        'packages/core/src/index.ts',
        DEFAULT_GIGANTISM_CONFIG,
        FORBIDDEN_IMPORT_RULES,
      );
      expect(findings.length).toBeGreaterThan(0);
    });

    it('should skip non-src files', () => {
      const findings = analyzeFile(
        'x'.repeat(500),
        'tools/test.ts',
        DEFAULT_GIGANTISM_CONFIG,
        FORBIDDEN_IMPORT_RULES,
      );
      expect(findings).toHaveLength(0);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should handle empty files', () => {
      const findings = analyzeFile(
        '',
        'packages/core/src/empty.ts',
        DEFAULT_GIGANTISM_CONFIG,
        FORBIDDEN_IMPORT_RULES,
      );
      expect(findings).toHaveLength(0);
    });

    it('should handle custom config thresholds', () => {
      const findings = checkGigantism(50, 'src/test.ts', { maxLines: 100, targetLines: 30 });
      expect(findings).toHaveLength(1);
      expect(findings[0].type).toBe('WARNING');
    });
  });
});
