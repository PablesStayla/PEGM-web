import { describe, expect, it } from 'vitest';
import {
  classifySeverity,
  RemediationStatus,
  RiskAssessment,
  SecurityTriageReport,
  SeverityLevel,
  SeveritySchema,
  Vulnerability,
  VulnerabilitySchema,
} from './security-triage-logic.js';

describe('security-triage-logic', () => {
  describe('SeverityLevel', () => {
    it('should be a function', () => {
      expect(typeof SeverityLevel).toBe('function');
    });
  });
  describe('Vulnerability', () => {
    it('should be a function', () => {
      expect(typeof Vulnerability).toBe('function');
    });
  });
  describe('RiskAssessment', () => {
    it('should be a function', () => {
      expect(typeof RiskAssessment).toBe('function');
    });
  });
  describe('RemediationStatus', () => {
    it('should be a function', () => {
      expect(typeof RemediationStatus).toBe('function');
    });
  });
  describe('SecurityTriageReport', () => {
    it('should be a function', () => {
      expect(typeof SecurityTriageReport).toBe('function');
    });
  });
  describe('SeveritySchema', () => {
    it('should be a function', () => {
      expect(typeof SeveritySchema).toBe('function');
    });
  });
  describe('VulnerabilitySchema', () => {
    it('should be a function', () => {
      expect(typeof VulnerabilitySchema).toBe('function');
    });
  });
  describe('classifySeverity', () => {
    it('should be a function', () => {
      expect(typeof classifySeverity).toBe('function');
    });
  });
});
