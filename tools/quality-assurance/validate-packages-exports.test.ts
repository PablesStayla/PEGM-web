import { describe, expect, it } from 'vitest';
import {
  validateExportEntry,
  validatePackageFields,
  validateSecondaryExports,
} from './validate-packages-exports.js';

const alwaysExists = () => true;
const neverExists = () => false;

describe('validate-packages-exports', () => {
  describe('validateExportEntry', () => {
    it('should error when no exports defined', () => {
      const pkg = { name: 'test', version: '1.0.0' };
      const errors = validateExportEntry(pkg, '/pkg', alwaysExists);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('No "exports" defined');
    });

    it('should error when main export "." missing', () => {
      const pkg = { name: 'test', version: '1.0.0', exports: { './utils': './utils.js' } };
      const errors = validateExportEntry(pkg, '/pkg', alwaysExists);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Missing main export');
    });

    it('should pass for string main export that exists', () => {
      const pkg = { name: 'test', version: '1.0.0', exports: { '.': './index.js' } };
      const errors = validateExportEntry(pkg, '/pkg', alwaysExists);
      expect(errors).toHaveLength(0);
    });

    it('should error for string main export that does not exist', () => {
      const pkg = { name: 'test', version: '1.0.0', exports: { '.': './index.js' } };
      const errors = validateExportEntry(pkg, '/pkg', neverExists);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('does not exist');
    });

    it('should validate conditional exports - types', () => {
      const pkg = {
        name: 'test',
        version: '1.0.0',
        exports: { '.': { types: './types.d.ts', import: './index.mjs' } },
      };
      const errors = validateExportEntry(pkg, '/pkg', neverExists);
      expect(errors.some((e) => e.includes('Types export'))).toBe(true);
    });

    it('should validate conditional exports - import', () => {
      const pkg = { name: 'test', version: '1.0.0', exports: { '.': { import: './index.mjs' } } };
      const errors = validateExportEntry(pkg, '/pkg', neverExists);
      expect(errors.some((e) => e.includes('Import export'))).toBe(true);
    });

    it('should validate conditional exports - require', () => {
      const pkg = { name: 'test', version: '1.0.0', exports: { '.': { require: './index.cjs' } } };
      const errors = validateExportEntry(pkg, '/pkg', neverExists);
      expect(errors.some((e) => e.includes('Require export'))).toBe(true);
    });

    it('should pass when all conditional exports exist', () => {
      const pkg = {
        name: 'test',
        version: '1.0.0',
        exports: { '.': { types: './types.d.ts', import: './index.mjs', require: './index.cjs' } },
      };
      const errors = validateExportEntry(pkg, '/pkg', alwaysExists);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateSecondaryExports', () => {
    it('should warn for missing secondary export files', () => {
      const pkg = {
        name: 'test',
        version: '1.0.0',
        exports: { '.': './index.js', './utils': './utils.js' },
      };
      const warnings = validateSecondaryExports(pkg, '/pkg', neverExists);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('./utils');
    });

    it('should skip main export "."', () => {
      const pkg = { name: 'test', version: '1.0.0', exports: { '.': './index.js' } };
      const warnings = validateSecondaryExports(pkg, '/pkg', neverExists);
      expect(warnings).toHaveLength(0);
    });

    it('should return empty when no exports', () => {
      const pkg = { name: 'test', version: '1.0.0' };
      const warnings = validateSecondaryExports(pkg, '/pkg', neverExists);
      expect(warnings).toHaveLength(0);
    });

    it('should pass for existing secondary exports', () => {
      const pkg = {
        name: 'test',
        version: '1.0.0',
        exports: { '.': './index.js', './utils': './utils.js' },
      };
      const warnings = validateSecondaryExports(pkg, '/pkg', alwaysExists);
      expect(warnings).toHaveLength(0);
    });
  });

  describe('validatePackageFields', () => {
    it('should warn for missing main field', () => {
      const pkg = { name: 'test', version: '1.0.0', main: './lib/index.js' };
      const warnings = validatePackageFields(pkg, '/pkg', neverExists);
      expect(warnings.some((w) => w.includes('Main'))).toBe(true);
    });

    it('should warn for missing module field', () => {
      const pkg = { name: 'test', version: '1.0.0', module: './esm/index.js' };
      const warnings = validatePackageFields(pkg, '/pkg', neverExists);
      expect(warnings.some((w) => w.includes('Module'))).toBe(true);
    });

    it('should warn for missing types field', () => {
      const pkg = { name: 'test', version: '1.0.0', types: './types/index.d.ts' };
      const warnings = validatePackageFields(pkg, '/pkg', neverExists);
      expect(warnings.some((w) => w.includes('Types'))).toBe(true);
    });

    it('should return empty when all fields exist or absent', () => {
      const pkg = { name: 'test', version: '1.0.0', main: './index.js', types: './types.d.ts' };
      const warnings = validatePackageFields(pkg, '/pkg', alwaysExists);
      expect(warnings).toHaveLength(0);
    });

    it('should return empty when no optional fields defined', () => {
      const pkg = { name: 'test', version: '1.0.0' };
      const warnings = validatePackageFields(pkg, '/pkg', neverExists);
      expect(warnings).toHaveLength(0);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should validate dropshipping-sdk package exports', () => {
      const pkg = {
        name: 'dropshipping-sdk',
        version: '2.1.0',
        exports: {
          '.': {
            types: './dist/types.d.ts',
            import: './dist/index.mjs',
            require: './dist/index.cjs',
          },
        },
      };
      const errors = validateExportEntry(pkg, '/packages/dropshipping-sdk', alwaysExists);
      expect(errors).toHaveLength(0);
    });

    it('should detect missing vendor integration export', () => {
      const pkg = {
        name: 'dropshipping-sdk',
        version: '2.1.0',
        exports: { '.': './dist/index.js', './vendor': './dist/vendor.js' },
      };
      const warnings = validateSecondaryExports(pkg, '/packages/dropshipping-sdk', neverExists);
      expect(warnings.some((w) => w.includes('./vendor'))).toBe(true);
    });
  });
});
