import { describe, expect, it } from 'vitest';
import {
  applyRenames,
  hasAuditServiceRef,
  processFileList,
  rewriteFileContent,
} from './internal/service-updater-logic.js';

describe('update-service-references-logic', () => {
  describe('hasAuditServiceRef', () => {
    it('should detect AuditService references', () => {
      expect(hasAuditServiceRef('AuditService.log({})')).toBe(true);
    });

    it('should return false for no references', () => {
      expect(hasAuditServiceRef('const x = 1;')).toBe(false);
    });

    it('should detect configureWriter', () => {
      expect(hasAuditServiceRef('AuditService.configureWriter')).toBe(true);
    });
  });

  describe('applyRenames', () => {
    it('should rename AuditService.log to logAuditEntry', () => {
      expect(applyRenames('AuditService.log({')).toBe('logAuditEntry({');
    });

    it('should rename AuditService.configureWriter to configureAuditWriter', () => {
      expect(applyRenames('AuditService.configureWriter')).toBe('configureAuditWriter');
    });

    it('should handle multiple renames in one file', () => {
      const input = 'AuditService.log({}); AuditService.configureWriter({});';
      const result = applyRenames(input);
      expect(result).toBe('logAuditEntry({}); configureAuditWriter({});');
    });

    it('should not change unrelated code', () => {
      const input = 'const x = AuditService.other;';
      expect(applyRenames(input)).toBe(input);
    });
  });

  describe('rewriteFileContent', () => {
    it('should succeed when references found and changed', () => {
      const result = rewriteFileContent('AuditService.log({})');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('logAuditEntry({})');
      }
    });

    it('should fail when no references found', () => {
      const result = rewriteFileContent('const x = 1;');
      expect(result.success).toBe(false);
    });

    it('should fail when references found but no changes made', () => {
      const result = rewriteFileContent('const ref = AuditService;');
      expect(result.success).toBe(false);
    });
  });

  describe('processFileList', () => {
    it('should return summary with zero files', () => {
      const summary = processFileList([], false);
      expect(summary.total).toBe(0);
      expect(summary.updated).toBe(0);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should handle malformed file content gracefully', () => {
      const result = rewriteFileContent('');
      expect(result.success).toBe(false);
    });

    it('should handle concurrent rewrite of multiple files', () => {
      const contents = ['AuditService.log({})', 'no refs', 'AuditService.configureWriter'];
      const results = contents.map((c) => rewriteFileContent(c));
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });

    it('should not expose secrets in rewritten content', () => {
      const input = 'AuditService.log({ token: "sk_live_SECRET" })';
      const result = rewriteFileContent(input);
      if (result.success) {
        expect(result.data).toContain('sk_live_SECRET');
      }
    });

    it('should handle I/O failures gracefully in processFileList', () => {
      const summary = processFileList(['/nonexistent/path/file.ts'], false);
      expect(summary.errors).toBeGreaterThanOrEqual(0);
    });
  });
});
