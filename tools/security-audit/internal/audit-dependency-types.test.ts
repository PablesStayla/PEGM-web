import { describe, expect, it } from 'vitest';
import { AdvisorySchema, AuditReportSchema } from './audit-dependency-types.js';

describe('audit-dependency-types', () => {
  describe('AdvisorySchema', () => {
    it('should reject null input', () => {
      const result = AdvisorySchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
  describe('AuditReportSchema', () => {
    it('should reject null input', () => {
      const result = AuditReportSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
