import { describe, expect, it } from 'vitest';
import { AdminCredentialsSchema } from './admin-types.js';

describe('admin-types', () => {
  describe('AdminCredentialsSchema', () => {
    it('should reject null input', () => {
      const result = AdminCredentialsSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
