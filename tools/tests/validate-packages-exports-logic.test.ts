import { describe, expect, it } from 'vitest';
import {
  validateExportEntry,
  validateSecondaryExports,
} from '../lib/validate-packages-exports-logic.js';

describe('validate-packages-exports-logic', () => {
  describe('validateExportEntry', () => {
    it('should pass valid export entry', () => {
      const result = validateExportEntry({
        name: '.',
        path: './dist/index.js',
        types: './dist/index.d.ts',
      });
      expect(result.valid).toBe(true);
    });
    it('should flag missing types', () => {
      const result = validateExportEntry({
        name: '.',
        path: './dist/index.js',
      });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateSecondaryExports', () => {
    it('should validate all exports', () => {
      const exports = {
        '.': { path: './dist/index.js', types: './dist/index.d.ts' },
        './utils': { path: './dist/utils.js', types: './dist/utils.d.ts' },
      };
      const results = validateSecondaryExports(exports as any);
      expect(results).toHaveLength(2);
    });
  });
});
