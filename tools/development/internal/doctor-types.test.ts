import { describe, expect, it } from 'vitest';
import { NodeVersionSchema, PnpmVersionSchema } from './doctor-types.js';

describe('doctor-types', () => {
  describe('NodeVersionSchema', () => {
    it('should reject null input', () => {
      const result = NodeVersionSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
  describe('PnpmVersionSchema', () => {
    it('should reject null input', () => {
      const result = PnpmVersionSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
