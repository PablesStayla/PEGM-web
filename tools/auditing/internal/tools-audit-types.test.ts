import { describe, expect, it } from 'vitest';
import { AuditStatusSchema, MCPConfigSchema } from './tools-audit-types.js';

describe('tools-audit-types', () => {
  describe('AuditStatusSchema', () => {
    it('should reject null input', () => {
      const result = AuditStatusSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
  describe('MCPConfigSchema', () => {
    it('should reject null input', () => {
      const result = MCPConfigSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
