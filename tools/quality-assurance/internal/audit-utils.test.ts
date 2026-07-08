import { describe, expect, it } from 'vitest';
import { realFsPort, toRelativePath, walkDir } from './audit-utils.js';

describe('audit-utils (shell)', () => {
  describe('realFsPort', () => {
    it('should have all required methods', () => {
      expect(typeof realFsPort.readdirSync).toBe('function');
      expect(typeof realFsPort.statSync).toBe('function');
      expect(typeof realFsPort.resolve).toBe('function');
      expect(typeof realFsPort.extname).toBe('function');
      expect(typeof realFsPort.basename).toBe('function');
      expect(typeof realFsPort.cwd).toBe('function');
      expect(typeof realFsPort.relative).toBe('function');
    });
  });

  describe('walkDir', () => {
    it('should be a function', () => {
      expect(typeof walkDir).toBe('function');
    });
  });

  describe('toRelativePath', () => {
    it('should be a function', () => {
      expect(typeof toRelativePath).toBe('function');
    });
  });
});
