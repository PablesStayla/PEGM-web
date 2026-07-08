import { describe, expect, it } from 'vitest';
import { ENV_RULES, ValidateEnvOptionsSchema } from '../lib/validate-env-types.js';

describe('validate-env-types', () => {
  describe('ValidateEnvOptionsSchema', () => {
    it('should validate default options', () => {
      const result = ValidateEnvOptionsSchema.safeParse({});
      expect(result.success).toBe(true);
    });
    it('should validate with envFile', () => {
      const result = ValidateEnvOptionsSchema.safeParse({
        envFile: '.env.production',
        verbose: true,
        json: false,
      });
      expect(result.success).toBe(true);
    });
    it('should reject invalid types', () => {
      const result = ValidateEnvOptionsSchema.safeParse({ verbose: 'yes' });
      expect(result.success).toBe(false);
    });
  });

  describe('ENV_RULES', () => {
    it('should have env rules defined', () => {
      expect(ENV_RULES.length).toBeGreaterThan(0);
    });
  });
});
