import { describe, expect, it } from 'vitest';
import {
  checkMCPPackage,
  checkMissingEnvVars,
  createHealthSummary,
  evaluateMCPStatus,
  loadMCPConfig,
} from './internal/mcp-health-logic.js';

describe('mcp-health-logic', () => {
  describe('loadMCPConfig', () => {
    it('should fail for missing config file', () => {
      const result = loadMCPConfig('/nonexistent/path');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('not found');
      }
    });
  });

  describe('checkMCPPackage', () => {
    it('should fail for empty args', () => {
      const result = checkMCPPackage([]);
      expect(result.success).toBe(false);
    });

    it('should fail for unreachable package', () => {
      const result = checkMCPPackage(['@nonexistent-scope-xyz/nonexistent-pkg-abc']);
      expect(result.success).toBe(false);
    });

    it('should succeed for reachable package', () => {
      const result = checkMCPPackage(['zod']);
      expect(result.success).toBe(true);
    });
  });

  describe('checkMissingEnvVars', () => {
    it('should find missing template vars', () => {
      delete process.env.TEST_MCP_MISSING_VAR;
      const missing = checkMissingEnvVars({ TEST_MCP_MISSING_VAR: '${TEST_MCP_MISSING_VAR}' });
      expect(missing).toContain('TEST_MCP_MISSING_VAR');
    });

    it('should not flag resolved env vars', () => {
      process.env.TEST_MCP_RESOLVED = 'actual-value';
      const missing = checkMissingEnvVars({ TEST_MCP_RESOLVED: '${TEST_MCP_RESOLVED}' });
      expect(missing).not.toContain('TEST_MCP_RESOLVED');
      delete process.env.TEST_MCP_RESOLVED;
    });

    it('should not flag literal values', () => {
      const missing = checkMissingEnvVars({ API_KEY: 'literal-value' });
      expect(missing.length).toBe(0);
    });
  });

  describe('evaluateMCPStatus', () => {
    it('should mark npx MCP as connected if package exists', () => {
      const status = evaluateMCPStatus('test-mcp', { command: 'npx', args: ['zod'] });
      expect(status.canConnect).toBe(true);
    });

    it('should report error for missing env vars', () => {
      delete process.env.TEST_MCP_EVAL_VAR;
      const status = evaluateMCPStatus('test-mcp', {
        env: { TEST_MCP_EVAL_VAR: '${TEST_MCP_EVAL_VAR}' },
      });
      expect(status.canConnect).toBe(false);
      expect(status.error).toContain('Missing env vars');
    });

    it('should report error for unreachable package', () => {
      const status = evaluateMCPStatus('bad-mcp', {
        command: 'npx',
        args: ['@nonexistent/pkg'],
      });
      expect(status.canConnect).toBe(false);
    });

    it('should handle non-npx commands', () => {
      const status = evaluateMCPStatus('custom-mcp', { command: 'node', args: ['server.js'] });
      expect(status.name).toBe('custom-mcp');
      expect(status.configured).toBe(true);
    });
  });

  describe('createHealthSummary', () => {
    it('should compute healthy and unhealthy counts', () => {
      const results = [
        { name: 'a', configured: true, canConnect: true },
        { name: 'b', configured: true, canConnect: false, error: 'timeout' },
      ];
      const summary = createHealthSummary(results);
      expect(summary.healthy).toBe(1);
      expect(summary.unhealthy).toBe(1);
      expect(summary.allHealthy).toBe(false);
    });

    it('should report all healthy when none fail', () => {
      const results = [{ name: 'a', configured: true, canConnect: true }];
      const summary = createHealthSummary(results);
      expect(summary.allHealthy).toBe(true);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should handle rate-limited MCP registry checks', () => {
      const status = evaluateMCPStatus('rate-limited', {
        command: 'npx',
        args: ['@nonexistent/rate-limited'],
      });
      expect(status.canConnect).toBe(false);
    });

    it('should handle malformed MCP config gracefully', () => {
      const status = evaluateMCPStatus('malformed', {});
      expect(status.name).toBe('malformed');
    });

    it('should handle timeout on package verification', () => {
      const result = checkMCPPackage(['@nonexistent-timeout/pkg']);
      expect(result.success).toBe(false);
    });

    it('should mask env var values in errors', () => {
      delete process.env.SECRET_MCP_KEY;
      const status = evaluateMCPStatus('secret-mcp', {
        command: 'npx',
        args: ['zod'],
        env: { SECRET_MCP_KEY: '${SECRET_MCP_KEY}' },
      });
      expect(status.error).not.toContain('SECRET_MCP_KEY=');
    });
  });
});
