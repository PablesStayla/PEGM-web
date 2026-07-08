import { describe, expect, it } from 'vitest';
import { clamp, isBlank, isUUIDv4, randomInt, sleep } from './utils';

describe('utils', () => {
  describe('sleep', () => {
    it('should wait for specified time', async () => {
      const start = Date.now();
      await sleep(50);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(40); // Permitir un pequeño margen de error en el timing
    });
  });

  describe('clamp', () => {
    it('should return value if within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('should return min if value is below range', () => {
      expect(clamp(-1, 0, 10)).toBe(0);
    });

    it('should return max if value is above range', () => {
      expect(clamp(11, 0, 10)).toBe(10);
    });
  });

  describe('isUUIDv4', () => {
    it('should return true for valid UUID v4', () => {
      expect(isUUIDv4('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isUUIDv4('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')).toBe(true);
    });

    it('should return false for invalid UUID', () => {
      expect(isUUIDv4('invalid-uuid')).toBe(false);
      expect(isUUIDv4('550e8400-e29b-11d4-a716-446655440000')).toBe(false); // v1
    });
  });

  describe('randomInt', () => {
    it('should return number within range', () => {
      for (let i = 0; i < 100; i++) {
        const val = randomInt(5, 10);
        expect(val).toBeGreaterThanOrEqual(5);
        expect(val).toBeLessThan(10);
        expect(Math.floor(val)).toBe(val);
      }
    });
  });

  describe('isBlank', () => {
    it('should return true for null or undefined', () => {
      expect(isBlank(null)).toBe(true);
      expect(isBlank(undefined)).toBe(true);
    });

    it('should return true for empty or whitespace string', () => {
      expect(isBlank('')).toBe(true);
      expect(isBlank('   ')).toBe(true);
      expect(isBlank('\n\t ')).toBe(true);
    });

    it('should return false for non-blank string', () => {
      expect(isBlank('a')).toBe(false);
      expect(isBlank(' text ')).toBe(false);
    });
  });
});
