import { describe, expect, it } from 'vitest';
import { ScreenshotConfigSchema, ScreenshotRouteSchema } from './screenshot-types.js';

describe('screenshot-types', () => {
  describe('ScreenshotRouteSchema', () => {
    it('should reject null input', () => {
      const result = ScreenshotRouteSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
  describe('ScreenshotConfigSchema', () => {
    it('should reject null input', () => {
      const result = ScreenshotConfigSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
