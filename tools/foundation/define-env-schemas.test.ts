import { describe, expect, it } from 'vitest';
import {
  ALL_SCHEMAS,
  AUTH_VARS,
  CORE_ENV_VARS,
  envVarSchemaZod,
  SUPABASE_VARS,
} from './define-env-schemas.js';

describe('define-env-schemas', () => {
  describe('CORE_ENV_VARS', () => {
    it('should have core env vars defined', () => {
      expect(CORE_ENV_VARS.length).toBeGreaterThan(0);
    });
    it('should each have name, required, and pattern', () => {
      for (const v of CORE_ENV_VARS) {
        expect(v.name).toBeTruthy();
        expect(typeof v.required).toBe('boolean');
      }
    });
  });

  describe('SUPABASE_VARS', () => {
    it('should have supabase vars defined', () => {
      expect(SUPABASE_VARS.length).toBeGreaterThan(0);
    });
  });

  describe('AUTH_VARS', () => {
    it('should have auth vars defined', () => {
      expect(AUTH_VARS.length).toBeGreaterThan(0);
    });
  });

  describe('ALL_SCHEMAS', () => {
    it('should combine all schema groups', () => {
      expect(ALL_SCHEMAS.length).toBeGreaterThanOrEqual(CORE_ENV_VARS.length);
    });
  });

  describe('envVarSchemaZod', () => {
    it('should validate a valid schema entry', () => {
      const result = envVarSchemaZod.safeParse({
        name: 'NODE_ENV',
        required: true,
        pattern: /^(development|production|test)$/,
        example: 'development',
        description: 'Node environment',
      });
      expect(result.success).toBe(true);
    });
    it('should reject invalid schema', () => {
      const result = envVarSchemaZod.safeParse({ invalid: true });
      expect(result.success).toBe(false);
    });
  });
});
