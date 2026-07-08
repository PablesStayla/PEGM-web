import { describe, expect, it } from 'vitest';
import { MCPConfigSchema } from './mcp-health-types.js';

describe('mcp-health-types', () => {
  describe('MCPConfigSchema', () => {
    it('should reject null input', () => {
      const result = MCPConfigSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
