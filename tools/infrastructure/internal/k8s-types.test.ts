import { describe, expect, it } from 'vitest';
import { K8sFilePathSchema } from './k8s-types.js';

describe('k8s-types', () => {
  describe('K8sFilePathSchema', () => {
    it('should reject null input', () => {
      const result = K8sFilePathSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
