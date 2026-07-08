import { describe, expect, it } from 'vitest';
import {
  checkContentContains,
  checkFileContains,
  checkFileExists,
  compileQaReport,
  formatQaReport,
} from './check-qa-gates.js';

describe('check-qa-gates', () => {
  const mockExists = (p: string) => p.includes('package.json');
  const mockReader = (p: string) =>
    p.includes('package.json')
      ? { success: true as const, data: '{"name":"test"}' }
      : { success: false as const, error: 'not found' };

  describe('checkFileExists', () => {
    it('should pass when file exists', () => {
      const result = checkFileExists('package.json', 'Package manifest', mockExists);
      expect(result.passed).toBe(true);
    });
    it('should fail when file missing', () => {
      const result = checkFileExists('missing.file', 'Missing file', mockExists);
      expect(result.passed).toBe(false);
    });
  });

  describe('checkFileContains', () => {
    it('should pass when content contains string', () => {
      const result = checkFileContains('package.json', 'name', mockReader);
      expect(result.passed).toBe(true);
    });
    it('should fail when content missing string', () => {
      const result = checkFileContains('package.json', 'nonexistent-key', mockReader);
      expect(result.passed).toBe(false);
    });
  });

  describe('checkContentContains', () => {
    it('should pass when string found in content', () => {
      const result = checkContentContains('hello world', 'hello', 'greeting');
      expect(result.passed).toBe(true);
    });
    it('should fail when string not found', () => {
      const result = checkContentContains('hello world', 'xyz', 'missing');
      expect(result.passed).toBe(false);
    });
  });

  describe('compileQaReport', () => {
    it('should compile results', () => {
      const results = [
        { name: 'a', passed: true, detail: 'ok' },
        { name: 'b', passed: false, detail: 'fail' },
      ];
      const report = compileQaReport(results as any);
      expect(report.total).toBe(2);
      expect(report.passed).toBe(1);
      expect(report.failed).toBe(1);
    });
  });

  describe('formatQaReport', () => {
    it('should format report as string', () => {
      const report = { total: 1, passed: 1, failed: 0, results: [] };
      const formatted = formatQaReport(report as any, 'Test');
      expect(typeof formatted).toBe('string');
    });
  });
});
