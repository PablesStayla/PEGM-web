import { describe, expect, it } from 'vitest';
import { countCriticalOrHigh, scanDirectory, scanFile } from '../lib/audit-secrets-logic.js';
import type { SecretScanPort } from '../lib/audit-secrets-types.js';

const mockPort: SecretScanPort = {
  readFile: () => 'API_KEY=sk-test-abc123secret',
  walkDir: () => ['config.env'],
};

describe('audit-secrets-logic', () => {
  describe('scanFile', () => {
    it('should detect secrets in file content', () => {
      const result = scanFile(mockPort, 'config.env');
      expect(result.findings.length).toBeGreaterThan(0);
    });
  });

  describe('scanDirectory', () => {
    it('should scan all files in directory', () => {
      const result = scanDirectory(mockPort, '/project');
      expect(result).toBeDefined();
    });
  });

  describe('countCriticalOrHigh', () => {
    it('should count critical and high findings', () => {
      const findings = [
        { severity: 'critical' as const, file: 'a', line: 1 },
        { severity: 'high' as const, file: 'b', line: 2 },
        { severity: 'low' as const, file: 'c', line: 3 },
      ];
      expect(countCriticalOrHigh(findings as any)).toBe(2);
    });
  });
});
