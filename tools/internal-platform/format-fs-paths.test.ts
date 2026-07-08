import { describe, expect, it } from 'vitest';
import { getRelativePath, readJson, walkDir } from './format-fs-paths.js';

describe('format-fs-paths', () => {
  describe('walkDir', () => {
    it('should return empty for nonexistent dir', () => {
      const result = walkDir('/nonexistent/path');
      expect(result).toEqual([]);
    });
    it('should return files for existing dir', () => {
      const result = walkDir('.');
      expect(result.length).toBeGreaterThan(0);
    });
    it('should filter by extension when provided', () => {
      const result = walkDir('.', '.json');
      expect(result.every((f) => f.endsWith('.json'))).toBe(true);
    });
  });

  describe('readJson', () => {
    it('should return null for nonexistent file', () => {
      const result = readJson('/nonexistent/file.json');
      expect(result).toBeNull();
    });
    it('should parse valid JSON file', () => {
      const result = readJson('package.json');
      expect(result).not.toBeNull();
      expect((result as any).name).toBeDefined();
    });
  });

  describe('getRelativePath', () => {
    it('should return relative path from cwd', () => {
      const result = getRelativePath(`${process.cwd()}/src/index.ts`);
      expect(result).not.toContain(process.cwd());
    });
  });
});
