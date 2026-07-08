import { describe, expect, it } from 'vitest';
import { GlobPatternSchema } from './service-updater-types.js';

describe('service-updater-types', () => {
  describe('GlobPatternSchema', () => {
    it('should reject null input', () => {
      const result = GlobPatternSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
