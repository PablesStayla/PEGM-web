import { describe, expect, it } from 'vitest';
import {
  checkFileContains,
  checkFileExists,
  compileK8sReport,
  formatK8sReport,
  runAllChecks,
} from './internal/k8s-logic.js';

describe('k8s-logic', () => {
  const existsYes: (p: string) => boolean = () => true;
  const existsNo: (p: string) => boolean = () => false;
  const readYes: (p: string) => string | null = () => 'resources:\n  - web-deployment.yaml';
  const readNo: (p: string) => string | null = () => null;

  describe('checkFileExists', () => {
    it('should pass when file exists', () => {
      const result = checkFileExists('infra/test.yaml', existsYes);
      expect(result.passed).toBe(true);
      expect(result.detail).toBe('present');
    });

    it('should fail when file missing', () => {
      const result = checkFileExists('infra/missing.yaml', existsNo);
      expect(result.passed).toBe(false);
      expect(result.detail).toBe('missing');
    });
  });

  describe('checkFileContains', () => {
    it('should pass when content contains expected string', () => {
      const result = checkFileContains(
        'kustomization.yaml',
        'resources:',
        'test',
        existsYes,
        readYes,
      );
      expect(result.passed).toBe(true);
    });

    it('should fail when content does not contain expected string', () => {
      const reader: (p: string) => string | null = () => 'other: content';
      const result = checkFileContains(
        'kustomization.yaml',
        'resources:',
        'test',
        existsYes,
        reader,
      );
      expect(result.passed).toBe(false);
    });

    it('should fail when file is missing', () => {
      const result = checkFileContains('missing.yaml', 'resources:', 'test', existsNo, readNo);
      expect(result.passed).toBe(false);
      expect(result.detail).toBe('file missing');
    });

    it('should fail when read returns null', () => {
      const result = checkFileContains('unreadable.yaml', 'resources:', 'test', existsYes, readNo);
      expect(result.passed).toBe(false);
      expect(result.detail).toBe('read error');
    });
  });

  describe('runAllChecks', () => {
    it('should return results for all required files and content checks', () => {
      const results = runAllChecks(existsYes, readYes);
      expect(results.length).toBeGreaterThanOrEqual(11);
    });

    it('should report failures when files missing', () => {
      const results = runAllChecks(existsNo, readNo);
      const failed = results.filter((r) => !r.passed);
      expect(failed.length).toBeGreaterThan(0);
    });
  });

  describe('compileK8sReport', () => {
    it('should count passed and failed', () => {
      const results = [
        { name: 'a', passed: true, detail: 'ok' },
        { name: 'b', passed: false, detail: 'missing' },
      ];
      const report = compileK8sReport(results);
      expect(report.passed).toBe(1);
      expect(report.failed).toBe(1);
      expect(report.total).toBe(2);
    });
  });

  describe('formatK8sReport', () => {
    it('should include pass message when no failures', () => {
      const report = compileK8sReport([{ name: 'a', passed: true, detail: 'ok' }]);
      const output = formatK8sReport(report);
      expect(output).toContain('passed');
    });

    it('should include fail message when failures exist', () => {
      const report = compileK8sReport([{ name: 'a', passed: false, detail: 'missing' }]);
      const output = formatK8sReport(report);
      expect(output).toContain('failed');
    });
  });

  describe('dropshipping scenarios', () => {
    it('should handle partial infrastructure (staging only)', () => {
      const partialExists: (p: string) => boolean = (p) => p.includes('staging');
      const results = runAllChecks(partialExists, readYes);
      const failed = results.filter((r) => !r.passed);
      expect(failed.length).toBeGreaterThan(0);
    });

    it('should handle empty infrastructure directory', () => {
      const results = runAllChecks(existsNo, readNo);
      expect(results.every((r) => !r.passed)).toBe(true);
    });

    it('should handle corrupted yaml content', () => {
      const corruptReader: (p: string) => string | null = () => '\x00\x01\x02';
      const result = checkFileContains(
        'corrupt.yaml',
        'resources:',
        'test',
        existsYes,
        corruptReader,
      );
      expect(result.passed).toBe(false);
    });
  });
});
