import { describe, expect, it } from 'vitest';
import { Money } from '../domain/value-objects/money.vo';

describe('Money Value Object', () => {
  describe('Creation', () => {
    it('should create money with valid amount and currency', () => {
      const result = Money.create(100, 'USD');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.amount).toBe(100);
        expect(result.value.currency).toBe('USD');
      }
    });

    it('should reject negative amounts', () => {
      const result = Money.create(-50, 'USD');
      expect(result.success).toBe(false);
    });

    it('should reject invalid currency', () => {
      const result = Money.create(100, 'INVALID' as any);
      expect(result.success).toBe(false);
    });

    it('should accept valid CLP currency', () => {
      const result = Money.create(10000, 'CLP');
      expect(result.success).toBe(true);
    });

    it('should create zero money', () => {
      const money = Money.zero('USD');
      expect(money.amount).toBe(0);
      expect(money.currency).toBe('USD');
    });
  });

  describe('Addition', () => {
    it('should add same currency money', () => {
      const money1 = Money.create(100, 'USD').value!;
      const money2 = Money.create(50, 'USD').value!;
      const result = money1.add(money2);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.amount).toBe(150);
      }
    });

    it('should reject different currency addition', () => {
      const money1 = Money.create(100, 'USD').value!;
      const money2 = Money.create(50, 'EUR').value!;
      const result = money1.add(money2);

      expect(result.success).toBe(false);
    });
  });

  describe('Subtraction', () => {
    it('should subtract same currency money', () => {
      const money1 = Money.create(100, 'USD').value!;
      const money2 = Money.create(30, 'USD').value!;
      const result = money1.subtract(money2);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.amount).toBe(70);
      }
    });

    it('should reject negative result', () => {
      const money1 = Money.create(50, 'USD').value!;
      const money2 = Money.create(100, 'USD').value!;
      const result = money1.subtract(money2);

      expect(result.success).toBe(false);
    });
  });

  describe('Multiplication', () => {
    it('should multiply by quantity', () => {
      const money = Money.create(100, 'USD').value!;
      const result = money.multiply(5);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.amount).toBe(500);
      }
    });

    it('should reject negative quantity', () => {
      const money = Money.create(100, 'USD').value!;
      const result = money.multiply(-1);

      expect(result.success).toBe(false);
    });

    it('should handle decimal results correctly', () => {
      const money = Money.create(19.99, 'USD').value!;
      const result = money.multiply(3);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.amount).toBe(59.97);
      }
    });
  });

  describe('Percentage', () => {
    it('should calculate percentage correctly', () => {
      const money = Money.create(100, 'USD').value!;
      const result = money.percentage(15);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.amount).toBe(15);
      }
    });

    it('should reject invalid percentage', () => {
      const money = Money.create(100, 'USD').value!;

      expect(money.percentage(150).success).toBe(false);
      expect(money.percentage(-5).success).toBe(false);
    });
  });

  describe('Comparison', () => {
    it('should compare equality', () => {
      const money1 = Money.create(100, 'USD').value!;
      const money2 = Money.create(100, 'USD').value!;
      const money3 = Money.create(50, 'USD').value!;

      expect(money1.equals(money2)).toBe(true);
      expect(money1.equals(money3)).toBe(false);
    });

    it('should compare greater than', () => {
      const money1 = Money.create(100, 'USD').value!;
      const money2 = Money.create(50, 'USD').value!;

      expect(money1.isGreaterThan(money2)).toBe(true);
      expect(money2.isGreaterThan(money1)).toBe(false);
    });

    it('should compare less than', () => {
      const money1 = Money.create(50, 'USD').value!;
      const money2 = Money.create(100, 'USD').value!;

      expect(money1.isLessThan(money2)).toBe(true);
      expect(money2.isLessThan(money1)).toBe(false);
    });
  });

  describe('Formatting', () => {
    it('should format as USD currency', () => {
      const money = Money.create(1234.56, 'USD').value!;
      expect(money.format('en-US')).toContain('$');
      expect(money.format('en-US')).toContain('1,234.56');
    });

    it('should format as CLP currency', () => {
      const money = Money.create(10000, 'CLP').value!;
      const formatted = money.format('es-CL');
      expect(formatted).toContain('$');
    });
  });

  describe('Serialization', () => {
    it('should serialize to primitives', () => {
      const money = Money.create(100, 'USD').value!;
      const primitives = money.toPrimitives();

      expect(primitives.amount).toBe(100);
      expect(primitives.currency).toBe('USD');
    });
  });
});
