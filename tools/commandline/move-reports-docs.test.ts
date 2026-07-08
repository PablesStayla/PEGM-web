import { describe, expect, it } from 'vitest';

describe('move-reports-batch', () => {
  describe('patternToRegex', () => {
    it('should convert simple pattern', async () => {
      const { patternToRegex } = await import('./move-reports-batch.js');
      const regex = patternToRegex('test.md');
      expect(regex.test('test.md')).toBe(true);
      expect(regex.test('other.md')).toBe(false);
    });

    it('should convert wildcard pattern', async () => {
      const { patternToRegex } = await import('./move-reports-batch.js');
      const regex = patternToRegex('FINAL_*.md');
      expect(regex.test('FINAL_report.md')).toBe(true);
      expect(regex.test('FINAL_123.md')).toBe(true);
      expect(regex.test('test.md')).toBe(false);
    });

    it('should handle wildcards in paths', async () => {
      const { patternToRegex } = await import('./move-reports-batch.js');
      const regex = patternToRegex('FINAL_*.md');
      expect(regex.test('FINAL_test.md')).toBe(true);
      expect(regex.test('FINAL_123.md')).toBe(true);
    });
  });

  describe('shouldMoveFile', () => {
    it('should match FINAL_ pattern', async () => {
      const { shouldMoveFile } = await import('./move-reports-batch.js');
      expect(shouldMoveFile('FINAL_report.md')).toBe(true);
      expect(shouldMoveFile('FINAL_123.md')).toBe(true);
    });

    it('should match MULTISWARM_ pattern', async () => {
      const { shouldMoveFile } = await import('./move-reports-batch.js');
      expect(shouldMoveFile('MULTISWARM_test.md')).toBe(true);
    });

    it('should match QUALITY_ pattern', async () => {
      const { shouldMoveFile } = await import('./move-reports-batch.js');
      expect(shouldMoveFile('QUALITY_report.md')).toBe(true);
    });

    it('should match VALIDATION_ pattern', async () => {
      const { shouldMoveFile } = await import('./move-reports-batch.js');
      expect(shouldMoveFile('VALIDATION_test.md')).toBe(true);
    });

    it('should match README_IMPROVEMENTS.md', async () => {
      const { shouldMoveFile } = await import('./move-reports-batch.js');
      expect(shouldMoveFile('README_IMPROVEMENTS.md')).toBe(true);
      expect(shouldMoveFile('readme_improvements.md')).toBe(false);
    });

    it('should match task_plan.md', async () => {
      const { shouldMoveFile } = await import('./move-reports-batch.js');
      expect(shouldMoveFile('task_plan.md')).toBe(true);
    });

    it('should match findings.md', async () => {
      const { shouldMoveFile } = await import('./move-reports-batch.js');
      expect(shouldMoveFile('findings.md')).toBe(true);
    });

    it('should match progress.md', async () => {
      const { shouldMoveFile } = await import('./move-reports-batch.js');
      expect(shouldMoveFile('progress.md')).toBe(true);
    });

    it('should match BUNDLE_OPTIMIZATION_ pattern', async () => {
      const { shouldMoveFile } = await import('./move-reports-batch.js');
      expect(shouldMoveFile('BUNDLE_OPTIMIZATION_test.md')).toBe(true);
    });

    it('should not match non-report files', async () => {
      const { shouldMoveFile } = await import('./move-reports-batch.js');
      expect(shouldMoveFile('README.md')).toBe(false);
      expect(shouldMoveFile('package.json')).toBe(false);
      expect(shouldMoveFile('index.ts')).toBe(false);
    });
  });

  describe('getMatchingFiles', () => {
    it('should return empty array for non-existent directory', async () => {
      const { getMatchingFiles } = await import('./move-reports-batch.js');
      const result = getMatchingFiles('/non-existent-dir');
      expect(result).toEqual([]);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should handle vendor report files', async () => {
      const { shouldMoveFile } = await import('./move-reports-batch.js');
      expect(shouldMoveFile('FINAL_vendor_report.md')).toBe(true);
    });

    it('should handle supplier validation reports', async () => {
      const { shouldMoveFile } = await import('./move-reports-batch.js');
      expect(shouldMoveFile('VALIDATION_supplier.md')).toBe(true);
    });

    it('should handle inventory reports', async () => {
      const { shouldMoveFile } = await import('./move-reports-batch.js');
      expect(shouldMoveFile('QUALITY_inventory.md')).toBe(true);
    });

    it('should handle multi-swarm coordination reports', async () => {
      const { shouldMoveFile } = await import('./move-reports-batch.js');
      expect(shouldMoveFile('MULTISWARM_coordination.md')).toBe(true);
    });
  });
});
