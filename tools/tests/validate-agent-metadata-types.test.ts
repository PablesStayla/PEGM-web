import { describe, expect, it } from 'vitest';
import { REQUIRED_FIELDS } from '../lib/validate-agent-metadata-types.js';

describe('validate-agent-metadata-types', () => {
  describe('REQUIRED_FIELDS', () => {
    it('should have required fields defined', () => {
      expect(REQUIRED_FIELDS.length).toBeGreaterThan(0);
    });
    it('should each be a non-empty string', () => {
      for (const field of REQUIRED_FIELDS) {
        expect(field).toBeTruthy();
        expect(typeof field).toBe('string');
      }
    });
  });
});
