import { describe, expect, it } from 'vitest';
import {
  hasLevelField,
  processFileContent,
  readFrontmatter,
  replaceFrontmatter,
  shouldProcessFile,
  validateLevelConfig,
} from './level-logic.js';

describe('level-logic', () => {
  describe('readFrontmatter', () => {
    it('should be a function', () => {
      expect(typeof readFrontmatter).toBe('function');
    });
  });
  describe('hasLevelField', () => {
    it('should be a function', () => {
      expect(typeof hasLevelField).toBe('function');
    });
  });
  describe('replaceFrontmatter', () => {
    it('should be a function', () => {
      expect(typeof replaceFrontmatter).toBe('function');
    });
  });
  describe('validateLevelConfig', () => {
    it('should be a function', () => {
      expect(typeof validateLevelConfig).toBe('function');
    });
  });
  describe('processFileContent', () => {
    it('should be a function', () => {
      expect(typeof processFileContent).toBe('function');
    });
  });
  describe('shouldProcessFile', () => {
    it('should be a function', () => {
      expect(typeof shouldProcessFile).toBe('function');
    });
  });
});
