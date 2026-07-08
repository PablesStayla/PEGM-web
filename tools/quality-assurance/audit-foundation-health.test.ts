import { describe, expect, it } from 'vitest';
import {
  compileFoundationResults,
  formatFoundationReport,
  RECOMMENDED_GITHUB,
  REQUIRED_CONFIGS,
  REQUIRED_ROOT_FILES,
} from './internal/foundation-logic.js';

describe('foundation-audit', () => {
  const allExist = () => true;
  const noneExist = () => false;
  const fullReadme = () => '# Quick Start\n## Stack\n## Estructura del proyecto\n## Seguridad';
  const noReadme = () => null;

  describe('compileFoundationResults', () => {
    it('should pass with all files and readme present', () => {
      const results = compileFoundationResults(allExist, fullReadme);
      expect(results).toHaveLength(0);
    });

    it('should report errors for missing root files', () => {
      const results = compileFoundationResults(noneExist, noReadme);
      const errors = results.filter((r) => r.severity === 'error');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should report warnings for missing docs', () => {
      const results = compileFoundationResults(noneExist, noReadme);
      const warnings = results.filter((r) => r.severity === 'warning');
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('should skip readme checks when readme is null', () => {
      const results = compileFoundationResults(allExist, noReadme);
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
    });
  });

  describe('required file constants', () => {
    it('should include README in root files', () => {
      expect(REQUIRED_ROOT_FILES.some((e) => e.key === 'README')).toBe(true);
    });

    it('should include package.json in root files', () => {
      expect(REQUIRED_ROOT_FILES.some((e) => e.key === 'package.json')).toBe(true);
    });

    it('should include TypeScript in configs', () => {
      expect(REQUIRED_CONFIGS.some((e) => e.key === 'TypeScript config')).toBe(true);
    });

    it('should include PR template in recommended github', () => {
      expect(RECOMMENDED_GITHUB.some((e) => e.key === 'PR template')).toBe(true);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should validate e-commerce project foundation', () => {
      const exists = (p: string) =>
        p === 'package.json' || p === 'tsconfig.json' || p === '.gitignore';
      const results = compileFoundationResults(exists, fullReadme);
      const errors = results.filter((r) => r.severity === 'error');
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
