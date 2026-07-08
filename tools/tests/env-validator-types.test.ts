import { describe, expect, it } from 'vitest';
import { ALL_ENV_SCHEMAS, CORE_ENV_VARS, envVarSchemaZod } from '../lib/env-validator-types.js';

describe('env-validator-types', () => {
  describe('envVarSchemaZod', () => {
    it('should validate a valid env schema entry', () => {
      const result = envVarSchemaZod.safeParse({
        name: 'NODE_ENV',
        required: true,
        pattern: /^(development|production|test)$/,
        example: 'development',
        description: 'Node environment',
      });
      expect(result.success).toBe(true);
    });
    it('should reject missing name', () => {
      const result = envVarSchemaZod.safeParse({ required: true });
      expect(result.success).toBe(false);
    });
  });

  describe('CORE_ENV_VARS', () => {
    it('should have core vars defined', () => {
      expect(CORE_ENV_VARS.length).toBeGreaterThan(0);
    });
  });

  describe('ALL_ENV_SCHEMAS', () => {
    it('should combine all schema groups', () => {
      expect(ALL_ENV_SCHEMAS.length).toBeGreaterThanOrEqual(CORE_ENV_VARS.length);
    });
  });
});
