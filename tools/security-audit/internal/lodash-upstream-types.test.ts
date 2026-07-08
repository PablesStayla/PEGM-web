import { describe, expect, it } from 'vitest';
import { DistTagsSchema } from './lodash-upstream-types.js';

describe('lodash-upstream-types', () => {
  describe('DistTagsSchema', () => {
    it('should reject null input', () => {
      const result = DistTagsSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
