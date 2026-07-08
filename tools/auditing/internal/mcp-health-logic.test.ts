import { describe, expect, it } from 'vitest';
import {
  checkMCPPackage,
  checkMissingEnvVars,
  createHealthSummary,
  evaluateMCPStatus,
  loadMCPConfig,
  runAllMCPChecks,
} from './mcp-health-logic.js';

describe('mcp-health-logic', () => {
  describe('loadMCPConfig', () => {
    it('should be a function', () => {
      expect(typeof loadMCPConfig).toBe('function');
    });
  });
  describe('checkMCPPackage', () => {
    it('should be a function', () => {
      expect(typeof checkMCPPackage).toBe('function');
    });
  });
  describe('checkMissingEnvVars', () => {
    it('should be a function', () => {
      expect(typeof checkMissingEnvVars).toBe('function');
    });
  });
  describe('evaluateMCPStatus', () => {
    it('should be a function', () => {
      expect(typeof evaluateMCPStatus).toBe('function');
    });
  });
  describe('createHealthSummary', () => {
    it('should be a function', () => {
      expect(typeof createHealthSummary).toBe('function');
    });
  });
  describe('runAllMCPChecks', () => {
    it('should be a function', () => {
      expect(typeof runAllMCPChecks).toBe('function');
    });
  });
});
