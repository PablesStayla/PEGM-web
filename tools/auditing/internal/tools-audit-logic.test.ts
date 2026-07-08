import { describe, expect, it } from 'vitest';
import {
  auditBiomeConfig,
  auditCLIs,
  auditDocumentation,
  auditMCPs,
  auditVSCodeExtensions,
  createAuditSummary,
} from './tools-audit-logic.js';

describe('tools-audit-logic', () => {
  describe('auditMCPs', () => {
    it('should be a function', () => {
      expect(typeof auditMCPs).toBe('function');
    });
  });
  describe('auditCLIs', () => {
    it('should be a function', () => {
      expect(typeof auditCLIs).toBe('function');
    });
  });
  describe('auditVSCodeExtensions', () => {
    it('should be a function', () => {
      expect(typeof auditVSCodeExtensions).toBe('function');
    });
  });
  describe('auditBiomeConfig', () => {
    it('should be a function', () => {
      expect(typeof auditBiomeConfig).toBe('function');
    });
  });
  describe('auditDocumentation', () => {
    it('should be a function', () => {
      expect(typeof auditDocumentation).toBe('function');
    });
  });
  describe('createAuditSummary', () => {
    it('should be a function', () => {
      expect(typeof createAuditSummary).toBe('function');
    });
  });
});
