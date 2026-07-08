import { describe, expect, it } from 'vitest';
import { CLEANUP_TARGETS, formatBytes, shouldSkipPattern } from './clean-artifacts-build.js';

describe('clean-artifacts', () => {
  describe('CLEANUP_TARGETS', () => {
    it('should have predefined cleanup targets', () => {
      expect(CLEANUP_TARGETS).toHaveLength(9);
    });

    it('should mark build artifacts as safe to delete', () => {
      const buildTarget = CLEANUP_TARGETS.find((t) => t.name === 'Build Artifacts');
      expect(buildTarget?.safeToDelete).toBe(true);
      expect(buildTarget?.patterns).toContain('dist');
      expect(buildTarget?.patterns).toContain('build');
    });

    it('should mark node_modules as safe to delete', () => {
      const depsTarget = CLEANUP_TARGETS.find((t) => t.name === 'Dependencies');
      expect(depsTarget?.safeToDelete).toBe(true);
      expect(depsTarget?.patterns).toContain('node_modules');
    });

    it('should mark IDE settings as NOT safe to delete', () => {
      const ideTarget = CLEANUP_TARGETS.find((t) => t.name === 'IDE Settings');
      expect(ideTarget?.safeToDelete).toBe(false);
    });

    it('should mark environment files as NOT safe to delete', () => {
      const envTarget = CLEANUP_TARGETS.find((t) => t.name === 'Environment Files');
      expect(envTarget?.safeToDelete).toBe(false);
    });
  });

  describe('formatBytes', () => {
    it('should format zero bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('should format bytes', () => {
      expect(formatBytes(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(2048)).toBe('2 KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(5242880)).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    it('should round to 2 decimal places', () => {
      const result = formatBytes(1234567);
      expect(result).toMatch(/^\d+\.\d{1,2} [KMG]?B$/);
    });
  });

  describe('shouldSkipPattern', () => {
    it('should skip node_modules at root', () => {
      expect(shouldSkipPattern('node_modules', true)).toBe(true);
    });

    it('should not skip node_modules in nested directories', () => {
      expect(shouldSkipPattern('node_modules', false)).toBe(false);
    });

    it('should skip .git', () => {
      expect(shouldSkipPattern('.git', true)).toBe(true);
    });

    it('should skip src', () => {
      expect(shouldSkipPattern('src', true)).toBe(true);
    });

    it('should skip app', () => {
      expect(shouldSkipPattern('app', true)).toBe(true);
    });

    it('should skip lib', () => {
      expect(shouldSkipPattern('lib', true)).toBe(true);
    });

    it('should not skip dist', () => {
      expect(shouldSkipPattern('dist', true)).toBe(false);
    });

    it('should not skip build', () => {
      expect(shouldSkipPattern('build', true)).toBe(false);
    });

    it('should not skip coverage', () => {
      expect(shouldSkipPattern('coverage', true)).toBe(false);
    });
  });

  describe('Cleanup Target Patterns', () => {
    it('should include TypeScript build info patterns', () => {
      const tsTarget = CLEANUP_TARGETS.find((t) => t.name === 'TypeScript');
      expect(tsTarget?.patterns).toContain('*.tsbuildinfo');
      expect(tsTarget?.patterns).toContain('tsconfig.tsbuildinfo');
    });

    it('should include log patterns', () => {
      const logTarget = CLEANUP_TARGETS.find((t) => t.name === 'Logs');
      expect(logTarget?.patterns).toContain('*.log');
      expect(logTarget?.patterns).toContain('logs');
    });

    it('should include cache patterns', () => {
      const cacheTarget = CLEANUP_TARGETS.find((t) => t.name === 'Cache Directories');
      expect(cacheTarget?.patterns).toContain('.cache');
      expect(cacheTarget?.patterns).toContain('.turbo');
      expect(cacheTarget?.patterns).toContain('.vite');
    });

    it('should include test coverage patterns', () => {
      const coverageTarget = CLEANUP_TARGETS.find((t) => t.name === 'Test Coverage');
      expect(coverageTarget?.patterns).toContain('coverage');
      expect(coverageTarget?.patterns).toContain('.nyc_output');
    });
  });
});
