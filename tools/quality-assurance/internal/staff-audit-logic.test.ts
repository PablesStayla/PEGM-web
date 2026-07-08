import { describe, expect, it } from 'vitest';
import {
  classifyFindingType,
  resolveFirstExisting,
  SCAN_ROOTS,
  SeverityLevel,
  StaffAuditStats,
  SUB_AUDIT_SCRIPTS,
  SubAuditConfig,
  toPosixPath,
} from './staff-audit-logic.js';

describe('staff-audit-logic', () => {
  describe('SeverityLevel', () => {
    it('should be a function', () => {
      expect(typeof SeverityLevel).toBe('function');
    });
  });
  describe('StaffAuditStats', () => {
    it('should be a function', () => {
      expect(typeof StaffAuditStats).toBe('function');
    });
  });
  describe('SubAuditConfig', () => {
    it('should be a function', () => {
      expect(typeof SubAuditConfig).toBe('function');
    });
  });
  describe('SCAN_ROOTS', () => {
    it('should be a function', () => {
      expect(typeof SCAN_ROOTS).toBe('function');
    });
  });
  describe('SUB_AUDIT_SCRIPTS', () => {
    it('should be a function', () => {
      expect(typeof SUB_AUDIT_SCRIPTS).toBe('function');
    });
  });
  describe('toPosixPath', () => {
    it('should be a function', () => {
      expect(typeof toPosixPath).toBe('function');
    });
  });
  describe('resolveFirstExisting', () => {
    it('should be a function', () => {
      expect(typeof resolveFirstExisting).toBe('function');
    });
  });
  describe('classifyFindingType', () => {
    it('should be a function', () => {
      expect(typeof classifyFindingType).toBe('function');
    });
  });
});
