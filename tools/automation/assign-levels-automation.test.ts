import { describe, expect, it } from 'vitest';
import {
  hasLevelField,
  processFileContent,
  readFrontmatter,
  replaceFrontmatter,
  shouldProcessFile,
  validateLevelConfig,
} from './internal/level-logic.js';

describe('level-logic', () => {
  describe('readFrontmatter', () => {
    it('should extract frontmatter from content', () => {
      const content = '---\nname: test\n---\nBody';
      expect(readFrontmatter(content)).toBe('name: test');
    });

    it('should return null for content without frontmatter', () => {
      expect(readFrontmatter('no frontmatter')).toBeNull();
    });

    it('should handle CRLF line endings', () => {
      const content = '---\r\nname: test\r\n---\r\nBody';
      expect(readFrontmatter(content)).toBe('name: test');
    });
  });

  describe('hasLevelField', () => {
    it('should detect level field', () => {
      expect(hasLevelField('name: test\nlevel: staff')).toBe(true);
    });

    it('should return false when no level field', () => {
      expect(hasLevelField('name: test\ndescription: test')).toBe(false);
    });

    it('should handle whitespace around level', () => {
      expect(hasLevelField('name: test\n  level  : staff')).toBe(true);
    });
  });

  describe('replaceFrontmatter', () => {
    it('should replace existing frontmatter', () => {
      const content = '---\nname: test\n---\nBody';
      const result = replaceFrontmatter(content, 'name: test\nlevel: staff');
      expect(result).toContain('level: staff');
      expect(result).toContain('Body');
    });

    it('should add frontmatter when missing', () => {
      const content = 'No frontmatter here';
      const result = replaceFrontmatter(content, 'name: test');
      expect(result).toContain('---\nname: test\n---');
    });
  });

  describe('validateLevelConfig', () => {
    it('should accept valid config', () => {
      const result = validateLevelConfig('staff', '2025-01-15');
      expect(result.success).toBe(true);
    });

    it('should reject empty level', () => {
      const result = validateLevelConfig('', '2025-01-15');
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const result = validateLevelConfig('staff', 'not-a-date');
      expect(result.success).toBe(false);
    });
  });

  describe('processFileContent', () => {
    it('should add level to frontmatter', () => {
      const content = '---\nname: test\n---\nBody';
      const result = processFileContent({
        content,
        filePath: 'test.md',
        level: 'staff',
        date: '2025-01-15',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('level: staff');
        expect(result.data).toContain('last_reviewed: 2025-01-15');
      }
    });

    it('should not modify content that already has level', () => {
      const content = '---\nname: test\nlevel: senior\n---\nBody';
      const result = processFileContent({
        content,
        filePath: 'test.md',
        level: 'staff',
        date: '2025-01-15',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(content);
      }
    });

    it('should fail for content without frontmatter', () => {
      const result = processFileContent({
        content: 'no frontmatter',
        filePath: 'test.md',
        level: 'staff',
        date: '2025-01-15',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('shouldProcessFile', () => {
    it('should return true for frontmatter without level', () => {
      expect(shouldProcessFile('name: test')).toBe(true);
    });

    it('should return false for frontmatter with level', () => {
      expect(shouldProcessFile('name: test\nlevel: staff')).toBe(false);
    });

    it('should return false for null frontmatter', () => {
      expect(shouldProcessFile(null)).toBe(false);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should handle malformed frontmatter gracefully', () => {
      const content = '---\nname:\n---\nBody';
      const result = processFileContent({
        content,
        filePath: 'broken.md',
        level: 'staff',
        date: '2025-01-15',
      });

      expect(result.success).toBe(true);
    });

    it('should handle vendor config files with special characters', () => {
      const content = '---\nname: "test: special"\ndescription: "has: colons"\n---\nBody';
      const result = processFileContent({
        content,
        filePath: 'vendor.md',
        level: 'staff',
        date: '2025-01-15',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('level: staff');
      }
    });

    it('should not overwrite existing level field', () => {
      const content = '---\nname: test\nlevel: senior\n---\nBody';
      const result = processFileContent({
        content,
        filePath: 'test.md',
        level: 'junior',
        date: '2025-06-01',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toContain('junior');
        expect(result.data).toContain('senior');
      }
    });
  });
});
