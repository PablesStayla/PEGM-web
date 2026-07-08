import { describe, expect, it } from 'vitest';
import { CleanupOptionsSchema } from '../lib/clean-artifacts-types.js';

describe('clean-artifacts-types', () => {
  describe('CleanupOptionsSchema', () => {
    it('should validate default options', () => {
      const result = CleanupOptionsSchema.safeParse({});
      expect(result.success).toBe(true);
    });
    it('should validate dry-run option', () => {
      const result = CleanupOptionsSchema.safeParse({ dryRun: true });
      expect(result.success).toBe(true);
    });
  });
});
