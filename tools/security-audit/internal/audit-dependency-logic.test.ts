import { describe, expect, it } from 'vitest';
import { extractJson, formatAdvisory, parseAuditReport } from './audit-dependency-logic.js';

describe('audit-dependency-logic', () => {
  describe('extractJson', () => {
    it('should be a function', () => {
      expect(typeof extractJson).toBe('function');
    });
  });
  describe('parseAuditReport', () => {
    it('should be a function', () => {
      expect(typeof parseAuditReport).toBe('function');
    });
  });
  describe('formatAdvisory', () => {
    it('should be a function', () => {
      expect(typeof formatAdvisory).toBe('function');
    });
  });
});
