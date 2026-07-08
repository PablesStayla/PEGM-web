import { describe, expect, it } from 'vitest';
import {
  applyRenames,
  hasAuditServiceRef,
  processFile,
  processFileList,
  rewriteFileContent,
} from './service-updater-logic.js';

describe('service-updater-logic', () => {
  describe('hasAuditServiceRef', () => {
    it('should be a function', () => {
      expect(typeof hasAuditServiceRef).toBe('function');
    });
  });
  describe('applyRenames', () => {
    it('should be a function', () => {
      expect(typeof applyRenames).toBe('function');
    });
  });
  describe('rewriteFileContent', () => {
    it('should be a function', () => {
      expect(typeof rewriteFileContent).toBe('function');
    });
  });
  describe('processFile', () => {
    it('should be a function', () => {
      expect(typeof processFile).toBe('function');
    });
  });
  describe('processFileList', () => {
    it('should be a function', () => {
      expect(typeof processFileList).toBe('function');
    });
  });
});
