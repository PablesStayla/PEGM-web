import { describe, expect, it } from 'vitest';
import { Money } from '../domain/value-objects/money.vo';

describe('Money - Arithmetic Operations', () => {
  describe('addition', () => {
    it('should add same currency', () => {
      const money1 = Money.create(100, 'USD').value;
      const money2 = Money.create(50, 'USD').value;
      const result = money1.add(money2);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.amount).toBe(150);
      }
    });

    it('should reject different currencies', () => {
      const money1 = Money.create(100, 'USD').value;
      const money2 = Money.create(50, 'EUR').value;
      const result = money1.add(money2);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRENCY_MISMATCH');
    });
  });

  describe('subtraction', () => {
    it('should subtract same currency', () => {
      const money1 = Money.create(100, 'USD').value;
      const money2 = Money.create(30, 'USD').value;
      const result = money1.subtract(money2);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.amount).toBe(70);
      }
    });

    it('should reject negative result', () => {
      const money1 = Money.create(50, 'USD').value;
      const money2 = Money.create(100, 'USD').value;
      const result = money1.subtract(money2);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NEGATIVE_RESULT');
    });

    it('should reject different currencies', () => {
      const money1 = Money.create(100, 'USD').value;
      const money2 = Money.create(50, 'EUR').value;
      const result = money1.subtract(money2);

      expect(result.success).toBe(false);
    });
  });

  describe('multiplication', () => {
    it('should multiply by quantity', () => {
      const money = Money.create(10, 'USD').value;
      const result = money.multiply(5);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.amount).toBe(50);
      }
    });

    it('should handle decimal results', () => {
      const money = Money.create(19.99, 'USD').value;
      const result = money.multiply(3);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.amount).toBe(59.97);
      }
    });

    it('should reject negative quantity', () => {
      const money = Money.create(10, 'USD').value;
      const result = money.multiply(-1);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NEGATIVE_FACTOR');
    });

    it('should handle zero quantity', () => {
      const money = Money.create(100, 'USD').value;
      const result = money.multiply(0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.amount).toBe(0);
      }
    });
  });

  describe('percentage', () => {
    it('should calculate percentage', () => {
      const money = Money.create(100, 'USD').value;
      const result = money.percentage(15);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.amount).toBe(15);
      }
    });

    it('should reject percentage over 100', () => {
      const money = Money.create(100, 'USD').value;
      const result = money.percentage(101);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_PERCENTAGE');
    });

    it('should reject negative percentage', () => {
      const money = Money.create(100, 'USD').value;
      const result = money.percentage(-5);

      expect(result.success).toBe(false);
    });

    it('should handle decimal percentages', () => {
      const money = Money.create(100, 'USD').value;
      const result = money.percentage(10.5);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.amount).toBe(10.5);
      }
    });
  });
});

describe('Money - Comparison Operations', () => {
  it('should be equal for same amount and currency', () => {
    const money1 = Money.create(100, 'USD').value;
    const money2 = Money.create(100, 'USD').value;

    expect(money1.equals(money2)).toBe(true);
  });

  it('should not be equal for different amount', () => {
    const money1 = Money.create(100, 'USD').value;
    const money2 = Money.create(50, 'USD').value;

    expect(money1.equals(money2)).toBe(false);
  });

  it('should not be equal for different currency', () => {
    const money1 = Money.create(100, 'USD').value;
    const money2 = Money.create(100, 'EUR').value;

    expect(money1.equals(money2)).toBe(false);
  });

  it('should be greater than', () => {
    const money1 = Money.create(100, 'USD').value;
    const money2 = Money.create(50, 'USD').value;

    expect(money1.isGreaterThan(money2)).toBe(true);
  });

  it('should be less than', () => {
    const money1 = Money.create(50, 'USD').value;
    const money2 = Money.create(100, 'USD').value;

    expect(money1.isLessThan(money2)).toBe(true);
  });

  it('should return false for different currency comparison', () => {
    const money1 = Money.create(100, 'USD').value;
    const money2 = Money.create(50, 'EUR').value;

    expect(money1.isGreaterThan(money2)).toBe(false);
    expect(money1.isLessThan(money2)).toBe(false);
  });
});
