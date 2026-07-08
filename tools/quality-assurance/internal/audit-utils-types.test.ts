import { describe, expect, it } from 'vitest';
import { DEFAULT_WALK_CONFIG } from './audit-utils-types.js';

describe('audit-utils-types', () => {
  describe('DEFAULT_WALK_CONFIG', () => {
    it('should have excludeDirs', () => {
      expect(DEFAULT_WALK_CONFIG.excludeDirs.length).toBeGreaterThan(0);
    });
    it('should have excludeFiles', () => {
      expect(DEFAULT_WALK_CONFIG.excludeFiles.length).toBeGreaterThan(0);
    });
    it('should have excludeExtensions', () => {
      expect(DEFAULT_WALK_CONFIG.excludeExtensions.length).toBeGreaterThan(0);
    });
    it('should have extensions', () => {
      expect(DEFAULT_WALK_CONFIG.extensions.length).toBeGreaterThan(0);
    });
    it('should have maxFileSizeBytes', () => {
      expect(DEFAULT_WALK_CONFIG.maxFileSizeBytes).toBe(512000);
    });
  });

  describe('FileWalkerPort', () => {
    it('should define the port interface', async () => {
      const mod = await import('./audit-utils-types.js');
      expect(mod.DEFAULT_WALK_CONFIG).toBeDefined();
    });
  });
});
