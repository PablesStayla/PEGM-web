import { describe, expect, it } from 'vitest';
import { CLEANUP_TARGETS } from '../lib/clean-artifacts-data.js';

describe('clean-artifacts-data', () => {
  describe('CLEANUP_TARGETS', () => {
    it('should have cleanup targets defined', () => {
      expect(CLEANUP_TARGETS.length).toBeGreaterThan(0);
    });
    it('should each have pattern and description', () => {
      for (const target of CLEANUP_TARGETS) {
        expect(target.pattern).toBeTruthy();
        expect(target.description).toBeTruthy();
      }
    });
  });
});
