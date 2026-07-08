/**
 * Tests for clean-repository.ts
 * Tests cleanup logic with edge cases
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('tinyglobby', () => ({
  glob: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  rm: vi.fn(),
}));

import { rm } from 'node:fs/promises';
import { glob } from 'tinyglobby';

describe('clean-repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteByPattern', () => {
    it('should return count of files in dry-run mode', async () => {
      const { deleteByPattern } = await import('./clean-repository.js');
      vi.mocked(glob).mockResolvedValue(['./file1.tsbuildinfo', './file2.tsbuildinfo']);

      const result = await deleteByPattern('**/*.tsbuildinfo', {
        dryRun: true,
        cwd: '/test',
      });

      expect(result).toBe(2);
      expect(rm).not.toHaveBeenCalled();
    });

    it('should delete files and return success count', async () => {
      const { deleteByPattern } = await import('./clean-repository.js');
      vi.mocked(glob).mockResolvedValue(['./file1.tsbuildinfo', './file2.tsbuildinfo']);
      vi.mocked(rm).mockResolvedValue(undefined);

      const result = await deleteByPattern('**/*.tsbuildinfo', {
        dryRun: false,
        cwd: '/test',
      });

      expect(result).toBe(2);
      expect(rm).toHaveBeenCalledTimes(2);
    });

    it('should handle empty file list', async () => {
      const { deleteByPattern } = await import('./clean-repository.js');
      vi.mocked(glob).mockResolvedValue([]);

      const result = await deleteByPattern('**/*.nonexistent', {
        dryRun: false,
        cwd: '/test',
      });

      expect(result).toBe(0);
    });

    it('should handle deletion errors gracefully', async () => {
      const { deleteByPattern } = await import('./clean-repository.js');
      vi.mocked(glob).mockResolvedValue(['./file1.txt']);
      vi.mocked(rm).mockRejectedValue(new Error('Permission denied'));

      const result = await deleteByPattern('**/*.txt', {
        dryRun: false,
        cwd: '/test',
      });

      expect(result).toBe(0);
    });
  });

  describe('runCleanup', () => {
    it('should process all cleanup tasks', async () => {
      const { runCleanup } = await import('./clean-repository.js');
      vi.mocked(glob).mockResolvedValue([]);

      const result = await runCleanup({
        dryRun: true,
        verbose: false,
        json: false,
      });

      expect(result.results).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('should accumulate deletion counts', async () => {
      const { runCleanup } = await import('./clean-repository.js');
      vi.mocked(glob)
        .mockResolvedValueOnce(['./file1.tsbuildinfo', './file2.tsbuildinfo'])
        .mockResolvedValue(['./file1.dist']);

      const result = await runCleanup({
        dryRun: true,
        verbose: false,
        json: false,
      });

      expect(result.totalDeleted).toBeGreaterThan(0);
    });

    it('should handle errors in tasks', async () => {
      const { runCleanup } = await import('./clean-repository.js');
      vi.mocked(glob).mockRejectedValue(new Error('Pattern error'));

      const result = await runCleanup({
        dryRun: false,
        verbose: false,
        json: false,
      });

      expect(result.results.some((r) => r.error)).toBeDefined();
    });
  });

  describe('cleanup tasks configuration', () => {
    it('should import tasks from define-cleanup-tasks', async () => {
      const { CLEANUP_TASKS } = await import('./define-cleanup-tasks.js');

      expect(CLEANUP_TASKS).toBeDefined();
      expect(CLEANUP_TASKS.length).toBeGreaterThan(0);
    });

    it('should include tsbuildinfo cleanup', async () => {
      const { CLEANUP_TASKS } = await import('./define-cleanup-tasks.js');
      const tsbuildTask = CLEANUP_TASKS.find((task) => task.id === 'tsbuildinfo');

      expect(tsbuildTask).toBeDefined();
      expect(tsbuildTask?.pattern).toContain('tsbuildinfo');
    });

    it('should include dist cleanup', async () => {
      const { CLEANUP_TASKS } = await import('./define-cleanup-tasks.js');
      const distTask = CLEANUP_TASKS.find((task) => task.id === 'dist');

      expect(distTask).toBeDefined();
      expect(distTask?.pattern).toBe('**/dist');
    });

    it('should include coverage cleanup', async () => {
      const { CLEANUP_TASKS } = await import('./define-cleanup-tasks.js');
      const coverageTask = CLEANUP_TASKS.find((task) => task.id === 'coverage');

      expect(coverageTask).toBeDefined();
      expect(coverageTask?.pattern).toBe('**/coverage');
    });

    it('should include log files cleanup', async () => {
      const { CLEANUP_TASKS } = await import('./define-cleanup-tasks.js');
      const logTask = CLEANUP_TASKS.find((task) => task.id === 'log-files');

      expect(logTask).toBeDefined();
      expect(logTask?.pattern).toBe('**/*.log');
    });
  });

  describe('edge cases - dropshipping scenarios', () => {
    it('should handle large monorepo with many artifacts', async () => {
      const { deleteByPattern } = await import('./clean-repository.js');
      const manyFiles = Array.from({ length: 100 }, (_, i) => `./package-${i}/dist/index.js`);
      vi.mocked(glob).mockResolvedValue(manyFiles);

      const result = await deleteByPattern('**/dist', {
        dryRun: true,
        cwd: '/test',
      });

      expect(result).toBe(100);
    });

    it('should handle nested node_modules exclusion', async () => {
      const { deleteByPattern } = await import('./clean-repository.js');
      vi.mocked(glob).mockResolvedValue(['./packages/app/dist', './packages/lib/dist']);

      const result = await deleteByPattern('**/dist', {
        dryRun: true,
        cwd: '/test',
      });

      expect(result).toBe(2);
    });

    it('should handle vendor dropshipping artifacts', async () => {
      const { deleteByPattern } = await import('./clean-repository.js');
      vi.mocked(glob).mockResolvedValue([
        './vendor-cache/supplier1/products.tmp',
        './vendor-cache/supplier2/inventory.log',
      ]);

      const result = await deleteByPattern('**/*.tmp', {
        dryRun: true,
        cwd: '/test',
      });

      expect(result).toBeGreaterThan(0);
    });
  });

  describe('displayResults', () => {
    it('should output JSON when json option is true', async () => {
      const { displayResults } = await import('./clean-repository.js');
      const consoleSpy = vi.spyOn(console, 'log');

      try {
        displayResults(
          {
            results: [{ pattern: '**/*.tmp', deleted: 5 }],
            totalDeleted: 5,
          },
          { dryRun: false, verbose: false, json: true },
        );

        expect(consoleSpy).toHaveBeenCalled();
        const jsonOutput = consoleSpy.mock.calls[0]?.[0];
        expect(jsonOutput).toContain('results');
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it('should show deleted items count', async () => {
      const { displayResults } = await import('./clean-repository.js');
      const consoleSpy = vi.spyOn(console, 'log');

      try {
        displayResults(
          {
            results: [{ pattern: '**/*.tmp', deleted: 10 }],
            totalDeleted: 10,
          },
          { dryRun: false, verbose: false, json: false },
        );

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Total deleted: 10'));
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });
});
