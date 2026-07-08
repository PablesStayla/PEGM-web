import { describe, expect, it } from 'vitest';
import { PrioritySchema } from './coverage-types.js';

describe('coverage-types', () => {
  describe('PrioritySchema', () => {
    it('should reject null input', () => {
      const result = PrioritySchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
