import { describe, expect, it } from 'vitest';
import {
  applyPackageJsonUpdate,
  isGteVersion,
  isPatchAvailable,
  parseDistTagsResponse,
  parseVersion,
} from './internal/lodash-upstream-logic.js';

describe('lodash-upstream-logic', () => {
  describe('parseVersion', () => {
    it('should parse valid semver', () => {
      const result = parseVersion('4.18.0');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([4, 18, 0]);
      }
    });

    it('should fail for invalid semver', () => {
      const result = parseVersion('invalid');
      expect(result.success).toBe(false);
    });

    it('should fail for partial semver', () => {
      const result = parseVersion('4.18');
      expect(result.success).toBe(false);
    });
  });

  describe('isGteVersion', () => {
    it('should return true when version is greater', () => {
      expect(isGteVersion('4.18.0', '4.17.0')).toBe(true);
    });

    it('should return true when versions are equal', () => {
      expect(isGteVersion('4.18.0', '4.18.0')).toBe(true);
    });

    it('should return false when version is less', () => {
      expect(isGteVersion('4.17.0', '4.18.0')).toBe(false);
    });

    it('should handle major version differences', () => {
      expect(isGteVersion('5.0.0', '4.18.0')).toBe(true);
    });

    it('should handle minor version differences', () => {
      expect(isGteVersion('4.19.0', '4.18.0')).toBe(true);
    });

    it('should handle invalid versions', () => {
      expect(isGteVersion('invalid', '4.18.0')).toBe(false);
    });
  });

  describe('parseDistTagsResponse', () => {
    it('should extract latest version', () => {
      const result = parseDistTagsResponse({ 'dist-tags': { latest: '4.18.0' } });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('4.18.0');
      }
    });

    it('should fail for missing dist-tags', () => {
      const result = parseDistTagsResponse({});
      expect(result.success).toBe(false);
    });

    it('should fail for missing latest', () => {
      const result = parseDistTagsResponse({ 'dist-tags': {} });
      expect(result.success).toBe(false);
    });

    it('should fail for invalid data', () => {
      const result = parseDistTagsResponse('not an object');
      expect(result.success).toBe(false);
    });
  });

  describe('applyPackageJsonUpdate', () => {
    it('should add lodash override', () => {
      const pkg = {};
      const result = applyPackageJsonUpdate(pkg, '4.18.0');
      expect(result.overrides?.lodash).toBe('4.18.0');
      expect(result.pnpm?.overrides?.lodash).toBe('4.18.0');
    });

    it('should update existing lodash override', () => {
      const pkg = { overrides: { lodash: '4.17.0' } };
      const result = applyPackageJsonUpdate(pkg, '4.18.0');
      expect(result.overrides?.lodash).toBe('4.18.0');
    });

    it('should not mutate original', () => {
      const pkg = { overrides: { lodash: '4.17.0' } };
      applyPackageJsonUpdate(pkg, '4.18.0');
      expect(pkg.overrides?.lodash).toBe('4.17.0');
    });
  });

  describe('isPatchAvailable', () => {
    it('should return true for versions >= MIN_PATCHED_VERSION', () => {
      expect(isPatchAvailable('4.18.0')).toBe(true);
      expect(isPatchAvailable('4.19.0')).toBe(true);
      expect(isPatchAvailable('5.0.0')).toBe(true);
    });

    it('should return false for versions < MIN_PATCHED_VERSION', () => {
      expect(isPatchAvailable('4.17.0')).toBe(false);
      expect(isPatchAvailable('4.17.21')).toBe(false);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should handle npm registry timeouts gracefully', () => {
      const result = parseDistTagsResponse(null);
      expect(result.success).toBe(false);
    });

    it('should handle malformed registry responses', () => {
      const result = parseDistTagsResponse({ unexpected: 'data' });
      expect(result.success).toBe(false);
    });

    it('should detect patch availability for vendor dependencies', () => {
      expect(isPatchAvailable('4.18.1')).toBe(true);
    });
  });
});
