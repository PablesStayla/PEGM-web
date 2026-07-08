import { describe, expect, it } from 'vitest';
import { LevelConfigSchema } from './level-types.js';

describe('level-types', () => {
  describe('LevelConfigSchema', () => {
    it('should reject null input', () => {
      const result = LevelConfigSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
