import { describe, expect, it } from 'vitest';
import type { FsPort } from '../lib/clean-repository-logic.js';
import { deleteByPattern, runCleanup } from '../lib/clean-repository-logic.js';

const mockFs: FsPort = {
  glob: () => ['dist/a.js', 'dist/b.js'],
  rm: () => {},
  cwd: () => '/project',
};

describe('clean-repository-logic', () => {
  describe('deleteByPattern', () => {
    it('should return count of deleted files', async () => {
      const result = await deleteByPattern(mockFs, 'dist/**/*.js', false);
      expect(result.deleted).toBe(2);
    });
    it('should return 0 in dry-run mode', async () => {
      const result = await deleteByPattern(mockFs, 'dist/**/*.js', true);
      expect(result.deleted).toBe(0);
    });
  });

  describe('runCleanup', () => {
    it('should run all cleanup tasks', async () => {
      const tasks = [{ pattern: 'dist/**/*.js', description: 'Build output' }];
      const summary = await runCleanup(mockFs, tasks, false);
      expect(summary.totalDeleted).toBe(2);
    });
  });
});
