import { describe, expect, it } from 'vitest';
import { ValidationCheckSchema, ValidationSummarySchema } from '../lib/validate-all-types.js';

describe('validate-all-types', () => {
  describe('ValidationCheckSchema', () => {
    it('should validate a valid check', () => {
      const result = ValidationCheckSchema.safeParse({
        name: 'lint',
        command: 'pnpm lint',
        required: true,
      });
      expect(result.success).toBe(true);
    });
    it('should reject missing name', () => {
      const result = ValidationCheckSchema.safeParse({ command: 'pnpm lint', required: true });
      expect(result.success).toBe(false);
    });
  });

  describe('ValidationSummarySchema', () => {
    it('should validate summary', () => {
      const result = ValidationSummarySchema.safeParse({
        total: 5,
        passed: 4,
        failed: 1,
        results: [],
      });
      expect(result.success).toBe(true);
    });
  });
});
