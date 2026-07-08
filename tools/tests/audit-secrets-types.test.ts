import { describe, expect, it } from 'vitest';
import { SecretPatternSchema, SecretScanResultSchema } from '../lib/audit-secrets-types.js';

describe('audit-secrets-types', () => {
  describe('SecretPatternSchema', () => {
    it('should validate a valid pattern', () => {
      const result = SecretPatternSchema.safeParse({
        name: 'API Key',
        pattern: 'sk-[a-zA-Z0-9]+',
        severity: 'high',
      });
      expect(result.success).toBe(true);
    });
    it('should reject invalid severity', () => {
      const result = SecretPatternSchema.safeParse({
        name: 'Bad',
        pattern: 'x',
        severity: 'extreme',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('SecretScanResultSchema', () => {
    it('should validate scan result', () => {
      const result = SecretScanResultSchema.safeParse({
        file: 'config.env',
        findings: [],
      });
      expect(result.success).toBe(true);
    });
  });
});
