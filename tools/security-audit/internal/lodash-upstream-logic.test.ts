import { describe, expect, it } from 'vitest';
import {
  applyPackageJsonUpdate,
  isGteVersion,
  isPatchAvailable,
  parseDistTagsResponse,
  parseVersion,
} from './lodash-upstream-logic.js';

describe('lodash-upstream-logic', () => {
  describe('parseVersion', () => {
    it('should be a function', () => {
      expect(typeof parseVersion).toBe('function');
    });
  });
  describe('isGteVersion', () => {
    it('should be a function', () => {
      expect(typeof isGteVersion).toBe('function');
    });
  });
  describe('parseDistTagsResponse', () => {
    it('should be a function', () => {
      expect(typeof parseDistTagsResponse).toBe('function');
    });
  });
  describe('applyPackageJsonUpdate', () => {
    it('should be a function', () => {
      expect(typeof applyPackageJsonUpdate).toBe('function');
    });
  });
  describe('isPatchAvailable', () => {
    it('should be a function', () => {
      expect(typeof isPatchAvailable).toBe('function');
    });
  });
});
