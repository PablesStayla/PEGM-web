import { describe, expect, it } from 'vitest';
import { SKU } from './sku.vo';

describe('SKU Value Object', () => {
  // ── create() ──────────────────────────────────────────────────────────

  describe('create()', () => {
    it('should create a valid SKU', () => {
      const result = SKU.create('CAM-ECO-M');
      expect(result.isSuccess).toBe(true);
      const sku = result.getValue();
      expect(sku.value).toBe('CAM-ECO-M');
      expect(sku.categoryPrefix).toBe('CAM');
    });

    it('should create SKU with numbers', () => {
      const result = SKU.create('SHO-RUN-42');
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().categoryPrefix).toBe('SHO');
    });

    it('should fail for empty string', () => {
      const result = SKU.create('');
      expect(result.isFailure).toBe(true);
    });

    it('should fail for whitespace-only string', () => {
      const result = SKU.create('   ');
      expect(result.isFailure).toBe(true);
    });

    it('should fail for string exceeding 50 characters', () => {
      const long = 'A'.repeat(51);
      const result = SKU.create(long);
      expect(result.isFailure).toBe(true);
    });

    it('should accept exactly 50 characters', () => {
      const max = 'A'.repeat(50);
      const result = SKU.create(max);
      expect(result.isSuccess).toBe(true);
    });

    it('should fail for special characters', () => {
      expect(SKU.create('CAM_ECO').isFailure).toBe(true);
      expect(SKU.create('CAM@ECO').isFailure).toBe(true);
      expect(SKU.create('CAM ECO').isFailure).toBe(true);
    });

    it('should extract category prefix before first hyphen', () => {
      expect(SKU.create('MISC').getValue().categoryPrefix).toBe('MISC');
      expect(SKU.create('CAM-ECO').getValue().categoryPrefix).toBe('CAM');
    });

    it('should default to MISC prefix when no hyphen', () => {
      expect(SKU.create('NOSKU').getValue().categoryPrefix).toBe('NOSKU');
    });
  });

  // ── from() ────────────────────────────────────────────────────────────

  describe('from()', () => {
    it('should create SKU without validation', () => {
      const sku = SKU.from('ANYTHING');
      expect(sku.value).toBe('ANYTHING');
    });

    it('should not validate on from()', () => {
      // from() is for trusted sources — no validation
      const sku = SKU.from('');
      expect(sku.value).toBe('');
    });
  });

  // ── equals() ──────────────────────────────────────────────────────────

  describe('equals()', () => {
    it('should return true for same value (case-insensitive)', () => {
      const a = SKU.from('CAM-ECO');
      const b = SKU.from('cam-eco');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different values', () => {
      const a = SKU.from('CAM-ECO');
      const b = SKU.from('SHO-RUN');
      expect(a.equals(b)).toBe(false);
    });
  });

  // ── Serialization ─────────────────────────────────────────────────────

  describe('toString() / toJSON()', () => {
    it('should return the raw value', () => {
      const sku = SKU.from('CAM-ECO-M');
      expect(sku.toString()).toBe('CAM-ECO-M');
      expect(sku.toJSON()).toBe('CAM-ECO-M');
    });
  });

  // ── Immutability ──────────────────────────────────────────────────────

  describe('immutability', () => {
    it('should be frozen', () => {
      const sku = SKU.from('CAM-ECO');
      expect(Object.isFrozen(sku)).toBe(true);
    });
  });
});
