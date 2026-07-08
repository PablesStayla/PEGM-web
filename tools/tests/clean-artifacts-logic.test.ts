/**
 * Clean Artifacts Logic — Unit Tests
 *
 * All I/O is mocked via FileSystemPort.
 * No real filesystem or network calls.
 */
import { describe, expect, it, vi } from 'vitest';
import {
  buildReport,
  CLEANUP_TARGETS,
  filterTargets,
  formatBytes,
  matchesPattern,
  scanAndClean,
  shouldSkipPattern,
  validateOptions,
} from '../lib/clean-artifacts-logic.js';
import type { CleanupResult, FileSystemPort } from '../lib/clean-artifacts-types.js';

// ============================================================================
// Mock FileSystemPort
// ============================================================================

const createMockFs = (overrides?: Partial<FileSystemPort>): FileSystemPort => ({
  readDir: vi.fn().mockResolvedValue([]),
  isDirectory: vi.fn().mockResolvedValue(false),
  getSize: vi.fn().mockResolvedValue(1024),
  remove: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

// ============================================================================
// shouldSkipPattern
// ============================================================================

describe('shouldSkipPattern', () => {
  it('should skip node_modules at root', () => {
    expect(shouldSkipPattern('node_modules', true)).toBe(true);
  });

  it('should NOT skip node_modules in nested dirs', () => {
    expect(shouldSkipPattern('node_modules', false)).toBe(false);
  });

  it('should skip .git at root', () => {
    expect(shouldSkipPattern('.git', true)).toBe(true);
  });

  it('should NOT skip dist at root', () => {
    expect(shouldSkipPattern('dist', true)).toBe(false);
  });
});

// ============================================================================
// matchesPattern
// ============================================================================

describe('matchesPattern', () => {
  it('should match exact names', () => {
    expect(matchesPattern('dist', ['dist', 'build'])).toBe(true);
  });

  it('should NOT match absent names', () => {
    expect(matchesPattern('src', ['dist', 'build'])).toBe(false);
  });

  it('should match wildcard patterns', () => {
    expect(matchesPattern('app.tsbuildinfo', ['*.tsbuildinfo'])).toBe(true);
  });

  it('should NOT match wildcard against non-matching', () => {
    expect(matchesPattern('app.ts', ['*.log'])).toBe(false);
  });
});

// ============================================================================
// filterTargets
// ============================================================================

describe('filterTargets', () => {
  it('should return only safe targets by default', () => {
    const result = filterTargets(CLEANUP_TARGETS);
    expect(result.every((t) => t.safeToDelete)).toBe(true);
  });

  it('should filter by specific target types', () => {
    const result = filterTargets(CLEANUP_TARGETS, ['dependencies']);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Dependencies');
  });

  it('should exclude patterns', () => {
    const result = filterTargets(CLEANUP_TARGETS, undefined, ['node_modules']);
    expect(result.some((t) => t.name === 'Dependencies')).toBe(false);
  });

  it('should return empty for non-existent target types', () => {
    const result = filterTargets(CLEANUP_TARGETS, ['nonexistent']);
    expect(result).toHaveLength(0);
  });
});

// ============================================================================
// formatBytes
// ============================================================================

describe('formatBytes', () => {
  it('should format zero bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('should format bytes', () => {
    expect(formatBytes(500)).toBe('500 B');
  });

  it('should format kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('should format megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
  });

  it('should format gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1 GB');
  });
});

// ============================================================================
// buildReport
// ============================================================================

describe('buildReport', () => {
  it('should build report from mixed results', () => {
    const results: CleanupResult[] = [
      { path: '/a/dist', success: true, size: 100 },
      { path: '/a/build', success: true, size: 200 },
      { path: '/a/locked', success: false, error: 'EACCES' },
    ];
    const report = buildReport(results);
    expect(report.cleaned).toBe(2);
    expect(report.failed).toBe(1);
    expect(report.totalSize).toBe(300);
  });

  it('should handle empty results', () => {
    const report = buildReport([]);
    expect(report.cleaned).toBe(0);
    expect(report.failed).toBe(0);
    expect(report.totalSize).toBe(0);
  });
});

// ============================================================================
// scanAndClean
// ============================================================================

describe('scanAndClean', () => {
  it('should clean matching entries in dry-run mode', async () => {
    const fs = createMockFs({
      readDir: vi.fn().mockResolvedValue(['dist', 'src', 'coverage']),
      isDirectory: vi.fn().mockResolvedValue(true),
    });

    const results = await scanAndClean(fs, '/project', ['dist', 'coverage'], true, true);

    expect(results).toHaveLength(2);
    expect(fs.remove).not.toHaveBeenCalled();
  });

  it('should remove entries when not dry-run', async () => {
    const fs = createMockFs({
      readDir: vi.fn().mockResolvedValue(['dist']),
      isDirectory: vi.fn().mockResolvedValue(true),
    });

    const _results = await scanAndClean(fs, '/project', ['dist'], false, true);

    expect(fs.remove).toHaveBeenCalledWith('/project/dist');
  });

  it('should skip dangerous patterns at root', async () => {
    const fs = createMockFs({
      readDir: vi.fn().mockResolvedValue(['.git', 'dist']),
      isDirectory: vi.fn().mockResolvedValue(true),
    });

    const results = await scanAndClean(fs, '/project', ['.git', 'dist'], true, true);

    // .git is dangerous, dist is not in patterns — but dist matches
    const paths = results.map((r) => r.path);
    expect(paths).not.toContain('/project/.git');
  });

  it('should handle readDir errors gracefully', async () => {
    const fs = createMockFs({
      readDir: vi.fn().mockRejectedValue(new Error('EACCES')),
    });

    const results = await scanAndClean(fs, '/project', ['dist'], true, true);

    expect(results).toHaveLength(0);
  });

  it('should NOT recurse into node_modules', async () => {
    const fs = createMockFs({
      readDir: vi.fn().mockResolvedValueOnce(['node_modules']).mockResolvedValue([]),
      isDirectory: vi.fn().mockResolvedValue(true),
    });

    await scanAndClean(fs, '/project', ['cache'], true, true);

    // node_modules should not trigger a recursive readDir
    expect(fs.readDir).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// validateOptions
// ============================================================================

describe('validateOptions', () => {
  it('should accept valid options', () => {
    const result = validateOptions({
      verbose: false,
      json: false,
      dryRun: true,
      rootPath: '/project',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dryRun).toBe(true);
    }
  });

  it('should reject missing rootPath', () => {
    const result = validateOptions({ verbose: false });
    expect(result.success).toBe(false);
  });

  it('should parse targets string into array', () => {
    const result = validateOptions({
      verbose: false,
      json: false,
      dryRun: false,
      targets: 'build,cache',
      rootPath: '/project',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.targets).toEqual(['build', 'cache']);
    }
  });
});

// ============================================================================
// CLEANUP_TARGETS data
// ============================================================================

describe('CLEANUP_TARGETS', () => {
  it('should have 9 targets', () => {
    expect(CLEANUP_TARGETS).toHaveLength(9);
  });

  it('should mark build artifacts as safe', () => {
    const t = CLEANUP_TARGETS.find((t) => t.name === 'Build Artifacts');
    expect(t?.safeToDelete).toBe(true);
  });

  it('should mark IDE settings as NOT safe', () => {
    const t = CLEANUP_TARGETS.find((t) => t.name === 'IDE Settings');
    expect(t?.safeToDelete).toBe(false);
  });
});
