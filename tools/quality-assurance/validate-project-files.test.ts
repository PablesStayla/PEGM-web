import { describe, expect, it } from 'vitest';
import {
  checkEntryList,
  checkReadmeSections,
  compileFoundationResults,
  formatFoundationReport,
  RECOMMENDED_GITHUB,
  REQUIRED_CONFIGS,
  REQUIRED_ROOT_FILES,
  resolveEntry,
} from './internal/foundation-logic.js';

describe('foundation-logic (project-files-validate)', () => {
  describe('resolveEntry', () => {
    it('should return first existing candidate', () => {
      const entry = { key: 'test', paths: ['a', 'b', 'c'] };
      expect(resolveEntry(entry, (p) => p === 'b')).toBe('b');
    });

    it('should return null when no candidate exists', () => {
      const entry = { key: 'test', paths: ['a', 'b'] };
      expect(resolveEntry(entry, () => false)).toBeNull();
    });

    it('should return first candidate when all exist', () => {
      const entry = { key: 'test', paths: ['x', 'y'] };
      expect(resolveEntry(entry, () => true)).toBe('x');
    });
  });

  describe('checkEntryList', () => {
    it('should return empty when all files exist', () => {
      const list = [{ key: 'README', paths: ['README.md'] }];
      const results = checkEntryList(list, 'error', () => true);
      expect(results).toHaveLength(0);
    });

    it('should report missing entries as errors', () => {
      const list = [{ key: 'README', paths: ['README.md'] }];
      const results = checkEntryList(list, 'error', () => false);
      expect(results).toHaveLength(1);
      expect(results[0].severity).toBe('error');
      expect(results[0].file).toBe('README');
    });

    it('should report missing entries as warnings', () => {
      const list = [{ key: 'Extra', paths: ['extra.md'] }];
      const results = checkEntryList(list, 'warning', () => false);
      expect(results).toHaveLength(1);
      expect(results[0].severity).toBe('warning');
    });

    it('should include checked paths in message', () => {
      const list = [{ key: 'test', paths: ['a.md', 'b.md'] }];
      const results = checkEntryList(list, 'error', () => false);
      expect(results[0].message).toContain('a.md | b.md');
    });
  });

  describe('checkReadmeSections', () => {
    it('should pass when all sections present', () => {
      const content = '# Quick Start\n## Stack\n## Estructura del proyecto\n## Seguridad';
      const results = checkReadmeSections(content);
      expect(results).toHaveLength(0);
    });

    it('should report missing Quick Start section', () => {
      const results = checkReadmeSections('# Some doc\n## Other section');
      expect(results.some((r) => r.message.includes('Quick Start'))).toBe(true);
    });

    it('should match Spanish section names', () => {
      const content = '# Inicio rápido\n## Stack\n## Estructura\n## Seguridad';
      const results = checkReadmeSections(content);
      expect(results).toHaveLength(0);
    });

    it('should match English section names', () => {
      const content = '# Quick Start\n## Stack\n## Structure\n## Security';
      const results = checkReadmeSections(content);
      expect(results).toHaveLength(0);
    });

    it('should report all missing sections for empty content', () => {
      const results = checkReadmeSections('');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('compileFoundationResults', () => {
    it('should combine all check categories', () => {
      const allExist = () => true;
      const results = compileFoundationResults(
        allExist,
        () => '# Quick Start\n## Stack\n## Estructura\n## Seguridad',
      );
      expect(results).toHaveLength(0);
    });

    it('should report missing root files as errors', () => {
      const noneExist = () => false;
      const results = compileFoundationResults(noneExist, () => null);
      const errors = results.filter((r) => r.severity === 'error');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should report missing docs as warnings', () => {
      const noneExist = () => false;
      const results = compileFoundationResults(noneExist, () => null);
      const warnings = results.filter((r) => r.severity === 'warning');
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('should skip readme checks when readme returns null', () => {
      const allExist = () => true;
      const results = compileFoundationResults(allExist, () => null);
      const readmeIssues = results.filter((r) => r.message.includes('section'));
      expect(readmeIssues).toHaveLength(0);
    });
  });

  describe('formatFoundationReport', () => {
    it('should format clean report', () => {
      const output = formatFoundationReport([]);
      expect(output).toContain('Errors: 0');
      expect(output).toContain('All required project files are present');
    });

    it('should format errors', () => {
      const results = [{ file: 'README', severity: 'error' as const, message: 'Missing' }];
      const output = formatFoundationReport(results);
      expect(output).toContain('Critical Files Missing');
      expect(output).toContain('README');
    });

    it('should format warnings', () => {
      const results = [{ file: 'Extra', severity: 'warning' as const, message: 'Missing' }];
      const output = formatFoundationReport(results);
      expect(output).toContain('Minor Omissions');
      expect(output).toContain('Extra');
    });
  });

  describe('required file constants', () => {
    it('REQUIRED_ROOT_FILES should include README', () => {
      expect(REQUIRED_ROOT_FILES.some((e) => e.key === 'README')).toBe(true);
    });

    it('REQUIRED_ROOT_FILES should include package.json', () => {
      expect(REQUIRED_ROOT_FILES.some((e) => e.key === 'package.json')).toBe(true);
    });

    it('REQUIRED_CONFIGS should include TypeScript config', () => {
      expect(REQUIRED_CONFIGS.some((e) => e.key === 'TypeScript config')).toBe(true);
    });

    it('RECOMMENDED_GITHUB should include PR template', () => {
      expect(RECOMMENDED_GITHUB.some((e) => e.key === 'PR template')).toBe(true);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should validate e-commerce project foundation', () => {
      const exists = (p: string) =>
        p === 'package.json' || p === 'tsconfig.json' || p === '.gitignore';
      const results = compileFoundationResults(
        exists,
        () => '# Quick Start\n## Stack\n## Estructura\n## Seguridad',
      );
      const errors = results.filter((r) => r.severity === 'error');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should warn on missing vendor onboarding docs', () => {
      const noneExist = () => false;
      const results = compileFoundationResults(noneExist, () => null);
      const docWarnings = results.filter(
        (r) => r.severity === 'warning' && r.file === 'Incidentes',
      );
      expect(docWarnings.length).toBeGreaterThan(0);
    });
  });
});
