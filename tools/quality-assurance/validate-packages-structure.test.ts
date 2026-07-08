import { describe, expect, it } from 'vitest';
import type { PackageJson } from '../libraries/types.js';
import {
  compilePackageValidation,
  validateExportPaths,
  validateRecommendedFields,
  validateRequiredFields,
} from './internal/validate-packages-logic.js';

describe('validate-packages', () => {
  describe('validateRequiredFields', () => {
    it('should pass valid package with all required fields', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
        main: './dist/index.js',
        module: './dist/index.mjs',
        types: './dist/index.d.ts',
        exports: { '.': './dist/index.js' },
      };

      const errors = validateRequiredFields(pkg);
      expect(errors).toHaveLength(0);
    });

    it('should fail when missing name', () => {
      const pkg = {
        version: '1.0.0',
        main: './dist/index.js',
        module: './dist/index.mjs',
        types: './dist/index.d.ts',
        exports: { '.': './dist/index.js' },
      } as PackageJson;

      const errors = validateRequiredFields(pkg);
      expect(errors.some((e) => e.includes('name'))).toBe(true);
    });

    it('should fail when missing version', () => {
      const pkg = {
        name: '@test/package',
        main: './dist/index.js',
        module: './dist/index.mjs',
        types: './dist/index.d.ts',
        exports: { '.': './dist/index.js' },
      } as PackageJson;

      const errors = validateRequiredFields(pkg);
      expect(errors.some((e) => e.includes('version'))).toBe(true);
    });

    it('should fail when missing exports', () => {
      const pkg = {
        name: '@test/package',
        version: '1.0.0',
        main: './dist/index.js',
        module: './dist/index.mjs',
        types: './dist/index.d.ts',
      } as PackageJson;

      const errors = validateRequiredFields(pkg);
      expect(errors.some((e) => e.includes('exports'))).toBe(true);
    });

    it('should fail when exports is empty object', () => {
      const pkg = {
        name: '@test/package',
        version: '1.0.0',
        main: './dist/index.js',
        module: './dist/index.mjs',
        types: './dist/index.d.ts',
        exports: {},
      } as PackageJson;

      const errors = validateRequiredFields(pkg);
      expect(errors.some((e) => e.includes('empty'))).toBe(true);
    });

    it('should require all 6 required fields', () => {
      const pkg = {} as PackageJson;
      const errors = validateRequiredFields(pkg);
      expect(errors.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('validateRecommendedFields', () => {
    it('should warn when missing recommended fields', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
        main: './dist/index.js',
        module: './dist/index.mjs',
        types: './dist/index.d.ts',
        exports: { '.': './dist/index.js' },
      };

      const warnings = validateRecommendedFields(pkg);
      expect(warnings.some((w) => w.includes('license'))).toBe(true);
      expect(warnings.some((w) => w.includes('repository'))).toBe(true);
      expect(warnings.some((w) => w.includes('author'))).toBe(true);
    });

    it('should pass when all recommended fields present', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
        main: './dist/index.js',
        module: './dist/index.mjs',
        types: './dist/index.d.ts',
        exports: { '.': './dist/index.js' },
        license: 'MIT',
        repository: { type: 'git', url: 'https://github.com/test/package' },
        author: 'Test Author',
      };

      const warnings = validateRecommendedFields(pkg);
      expect(warnings).toHaveLength(0);
    });
  });

  describe('validateExportPaths', () => {
    it('should pass for existing export files', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
        exports: { '.': './dist/index.js' },
      };

      const errors = validateExportPaths(pkg, '/pkg', () => true);
      expect(errors).toHaveLength(0);
    });

    it('should fail for non-existent export files', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
        exports: { '.': './dist/index.js' },
      };

      const errors = validateExportPaths(pkg, '/pkg', () => false);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should skip when no exports', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
      };

      const errors = validateExportPaths(pkg, '/pkg', () => false);
      expect(errors).toHaveLength(0);
    });
  });

  describe('compilePackageValidation', () => {
    it('should produce valid result for complete package', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
        main: './dist/index.js',
        module: './dist/index.mjs',
        types: './dist/index.d.ts',
        exports: { '.': './dist/index.js' },
        license: 'MIT',
        repository: { type: 'git', url: 'https://github.com/test' },
        author: 'Test',
      };

      const result = compilePackageValidation(pkg, '/pkg', () => true);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should produce invalid result for incomplete package', () => {
      const result = compilePackageValidation({} as PackageJson, '/pkg', () => false);
      expect(result.valid).toBe(false);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should validate vendor package exports', () => {
      const pkg: PackageJson = {
        name: '@pranakaia/vendor-sdk',
        version: '1.0.0',
        main: './dist/index.js',
        module: './dist/index.mjs',
        types: './dist/index.d.ts',
        exports: { '.': './dist/index.js' },
        license: 'MIT',
        repository: { type: 'git', url: 'https://github.com/test' },
        author: 'Team',
      };

      const result = compilePackageValidation(pkg, '/pkg', () => true);
      expect(result.valid).toBe(true);
    });
  });
});
