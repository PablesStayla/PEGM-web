import { describe, expect, it } from 'vitest';
import {
  buildDefaultRoutes,
  buildScreenshotResult,
  formatScreenshotReport,
  validateConfig,
} from './screenshot-logic.js';

describe('screenshot-logic', () => {
  describe('validateConfig', () => {
    it('should be a function', () => {
      expect(typeof validateConfig).toBe('function');
    });
  });
  describe('buildDefaultRoutes', () => {
    it('should be a function', () => {
      expect(typeof buildDefaultRoutes).toBe('function');
    });
  });
  describe('buildScreenshotResult', () => {
    it('should be a function', () => {
      expect(typeof buildScreenshotResult).toBe('function');
    });
  });
  describe('formatScreenshotReport', () => {
    it('should be a function', () => {
      expect(typeof formatScreenshotReport).toBe('function');
    });
  });
});
