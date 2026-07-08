import { describe, expect, it } from 'vitest';
import { DoraMetricsSchema } from './dora-types.js';

describe('dora-types', () => {
  describe('DoraMetricsSchema', () => {
    it('should reject null input', () => {
      const result = DoraMetricsSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
