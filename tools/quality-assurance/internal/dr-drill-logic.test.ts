import { describe, expect, it } from 'vitest';
import {
  checkScript,
  PackageScriptChecker,
  REQUIRED_DR_FILES,
  REQUIRED_DR_SCRIPTS,
} from './dr-drill-logic.js';

describe('dr-drill-logic', () => {
  describe('PackageScriptChecker', () => {
    it('should be a function', () => {
      expect(typeof PackageScriptChecker).toBe('function');
    });
  });
  describe('REQUIRED_DR_FILES', () => {
    it('should be a function', () => {
      expect(typeof REQUIRED_DR_FILES).toBe('function');
    });
  });
  describe('REQUIRED_DR_SCRIPTS', () => {
    it('should be a function', () => {
      expect(typeof REQUIRED_DR_SCRIPTS).toBe('function');
    });
  });
  describe('checkScript', () => {
    it('should be a function', () => {
      expect(typeof checkScript).toBe('function');
    });
  });
});
