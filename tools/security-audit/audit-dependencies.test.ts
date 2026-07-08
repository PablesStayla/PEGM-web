import { describe, expect, it } from 'vitest';
import {
  extractJson,
  formatAdvisory,
  parseAuditReport,
} from './internal/audit-dependency-logic.js';

describe('audit-dependency-logic', () => {
  describe('extractJson', () => {
    it('should extract JSON from raw output', () => {
      const raw = 'some prefix {"advisories":{}} suffix';
      const result = extractJson(raw);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('{"advisories":{}}');
      }
    });

    it('should fail for empty input', () => {
      const result = extractJson('');
      expect(result.success).toBe(false);
    });

    it('should fail for input without braces', () => {
      const result = extractJson('no json here');
      expect(result.success).toBe(false);
    });
  });

  describe('parseAuditReport', () => {
    it('should parse clean report', () => {
      const result = parseAuditReport('{"advisories":{}}');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.clean).toBe(true);
        expect(result.data.blocking).toHaveLength(0);
      }
    });

    it('should parse report with advisories', () => {
      const raw =
        '{"advisories":{"1":{"id":1,"title":"Test","module_name":"pkg","severity":"high","url":"https://example.com"}}}';
      const result = parseAuditReport(raw);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.clean).toBe(false);
        expect(result.data.blocking).toHaveLength(1);
      }
    });

    it('should fail for invalid JSON', () => {
      const result = parseAuditReport('not json');
      expect(result.success).toBe(false);
    });

    it('should handle report without advisories key', () => {
      const result = parseAuditReport('{}');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.clean).toBe(true);
      }
    });
  });

  describe('formatAdvisory', () => {
    it('should format advisory without reason', () => {
      const advisory = {
        id: 1,
        title: 'Vuln',
        module_name: 'pkg',
        severity: 'high',
        url: 'https://x.com',
      };
      const result = formatAdvisory(advisory);
      expect(result).toContain('[high]');
      expect(result).toContain('pkg');
      expect(result).toContain('https://x.com');
    });

    it('should format advisory with reason', () => {
      const advisory = {
        id: 1,
        title: 'Vuln',
        module_name: 'pkg',
        severity: 'low',
        url: 'https://x.com',
      };
      const result = formatAdvisory(advisory, 'upstream WIP');
      expect(result).toContain('upstream WIP');
    });
  });

  describe('dropshipping scenarios', () => {
    it('should handle empty advisories gracefully', () => {
      const result = parseAuditReport('{"advisories":{}}');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blocking).toHaveLength(0);
      }
    });

    it('should classify blocking vs tolerated advisories', () => {
      const raw =
        '{"advisories":{"99":{"id":99,"title":"T","module_name":"x","severity":"critical","url":"u"}}}';
      const result = parseAuditReport(raw);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blocking).toHaveLength(1);
      }
    });

    it('should handle malformed audit output', () => {
      const result = parseAuditReport('{invalid json}');
      expect(result.success).toBe(false);
    });
  });
});
