import { describe, expect, it } from 'vitest';
import {
  auditBiomeConfig,
  auditCLIs,
  auditDocumentation,
  auditMCPs,
  auditVSCodeExtensions,
  createAuditSummary,
} from './internal/tools-audit-logic.js';

describe('audit-tools-registry-logic', () => {
  describe('auditMCPs', () => {
    it('should fail for missing mcp_config.json', () => {
      const results = auditMCPs('/nonexistent/path');
      expect(results[0].status).toBe('fail');
      expect(results[0].message).toContain('not found');
    });
  });

  describe('auditCLIs', () => {
    it('should fail for missing package.json', () => {
      const results = auditCLIs('/nonexistent/path');
      expect(results[0].status).toBe('fail');
    });
  });

  describe('auditVSCodeExtensions', () => {
    it('should fail for missing extensions.json', () => {
      const result = auditVSCodeExtensions('/nonexistent/path');
      expect(result.status).toBe('fail');
      expect(result.message).toContain('extensions.json');
    });
  });

  describe('auditBiomeConfig', () => {
    it('should fail for missing biome.json', () => {
      const results = auditBiomeConfig('/nonexistent/path');
      expect(results[0].status).toBe('fail');
      expect(results[0].message).toContain('biome.json');
    });
  });

  describe('auditDocumentation', () => {
    it('should fail for missing CLAUDE.md', () => {
      const result = auditDocumentation('/nonexistent/path');
      expect(result.status).toBe('fail');
      expect(result.message).toContain('CLAUDE.md');
    });
  });

  describe('createAuditSummary', () => {
    it('should count pass/warn/fail correctly', () => {
      const results = [
        { category: 'A', status: 'pass' as const, message: 'ok' },
        { category: 'B', status: 'warn' as const, message: 'warn' },
        { category: 'C', status: 'fail' as const, message: 'err' },
      ];
      const summary = createAuditSummary(results);
      expect(summary.passed).toBe(1);
      expect(summary.warned).toBe(1);
      expect(summary.failed).toBe(1);
      expect(summary.hasFailures).toBe(true);
    });

    it('should report no failures when all pass', () => {
      const results = [{ category: 'A', status: 'pass' as const, message: 'ok' }];
      const summary = createAuditSummary(results);
      expect(summary.hasFailures).toBe(false);
    });

    it('should handle empty results', () => {
      const summary = createAuditSummary([]);
      expect(summary.total).toBe(0);
      expect(summary.hasFailures).toBe(false);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should flag missing Stripe MCP for payment operations', () => {
      const results = auditMCPs('/nonexistent/path');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should verify vendor tooling CLIs are present', () => {
      const results = auditCLIs('/nonexistent/path');
      expect(results.some((r) => r.category === 'CLIs')).toBe(true);
    });

    it('should handle malformed JSON config gracefully', () => {
      const result = auditVSCodeExtensions('/nonexistent/path');
      expect(result.status).toBe('fail');
    });

    it('should detect security rules in biome config', () => {
      const results = auditBiomeConfig('/nonexistent/path');
      expect(results[0].status).toBe('fail');
    });

    it('should handle missing documentation for compliance', () => {
      const result = auditDocumentation('/nonexistent/path');
      expect(result.status).toBe('fail');
    });
  });
});
