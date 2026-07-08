import { describe, expect, it } from 'vitest';
import { addMoney, moneySnapshot, multiplyMoney, OrderItem, OrderItemId } from './order-item.vo';

describe('OrderItem Value Object', () => {
  // ── Factory helpers ───────────────────────────────────────────────────

  describe('moneySnapshot()', () => {
    it('should create a frozen MoneySnapshot', () => {
      const m = moneySnapshot(29990, 'CLP');
      expect(m.amount).toBe(29990);
      expect(m.currency).toBe('CLP');
      expect(Object.isFrozen(m)).toBe(true);
    });
  });

  describe('multiplyMoney()', () => {
    it('should multiply a snapshot by quantity', () => {
      const m = moneySnapshot(19.99, 'USD');
      const total = multiplyMoney(m, 3);
      expect(total.amount).toBe(59.97);
      expect(total.currency).toBe('USD');
    });
  });

  describe('addMoney()', () => {
    it('should add two snapshots of same currency', () => {
      const a = moneySnapshot(100, 'CLP');
      const b = moneySnapshot(200, 'CLP');
      const result = addMoney(a, b);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amount).toBe(300);
    });

    it('should fail on currency mismatch', () => {
      const a = moneySnapshot(100, 'CLP');
      const b = moneySnapshot(200, 'USD');
      const result = addMoney(a, b);
      expect(result.isFailure).toBe(true);
    });
  });

  describe('OrderItemId', () => {
    it('should generate unique IDs', () => {
      const a = OrderItemId.generate();
      const b = OrderItemId.generate();
      expect(a).not.toBe(b);
      expect(a).toMatch(/^oi_\d+_/);
    });

    it('should create from trusted string', () => {
      const id = OrderItemId.from('oi_42');
      expect(id).toBe('oi_42');
    });
  });

  // ── OrderItem.create() ────────────────────────────────────────────────

  describe('create()', () => {
    const validProps = {
      id: OrderItemId.generate(),
      productId: 'prod_1',
      name: 'Camiseta Eco',
      sku: 'CAM-ECO-M',
      unitPrice: moneySnapshot(29990, 'CLP'),
      quantity: 2,
    };

    it('should create a valid OrderItem', () => {
      const result = OrderItem.create(validProps);
      expect(result.isSuccess).toBe(true);
      const item = result.getValue();
      expect(item.name).toBe('Camiseta Eco');
      expect(item.quantity).toBe(2);
      expect(item.subtotal.amount).toBe(59980);
    });

    it('should fail for zero quantity', () => {
      const result = OrderItem.create({ ...validProps, quantity: 0 });
      expect(result.isFailure).toBe(true);
    });

    it('should fail for negative quantity', () => {
      const result = OrderItem.create({ ...validProps, quantity: -1 });
      expect(result.isFailure).toBe(true);
    });

    it('should fail for zero unit price', () => {
      const result = OrderItem.create({ ...validProps, unitPrice: moneySnapshot(0, 'CLP') });
      expect(result.isFailure).toBe(true);
    });

    it('should fail for empty product name', () => {
      const result = OrderItem.create({ ...validProps, name: '   ' });
      expect(result.isFailure).toBe(true);
    });

    it('should fail for empty productId', () => {
      const result = OrderItem.create({ ...validProps, productId: '' });
      expect(result.isFailure).toBe(true);
    });

    it('should compute subtotal correctly', () => {
      const item = OrderItem.create(validProps).getValue();
      expect(item.subtotal.amount).toBe(59980);
      expect(item.subtotal.currency).toBe('CLP');
    });

    it('should include optional imageUrl', () => {
      const result = OrderItem.create({ ...validProps, imageUrl: 'https://img.test/cam.jpg' });
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().imageUrl).toBe('https://img.test/cam.jpg');
    });
  });

  // ── toPrimitives() ────────────────────────────────────────────────────

  describe('toPrimitives()', () => {
    it('should include subtotal in output', () => {
      const item = OrderItem.create({
        id: OrderItemId.from('oi_1'),
        productId: 'prod_1',
        name: 'Test Product',
        sku: 'TEST-1',
        unitPrice: moneySnapshot(100, 'USD'),
        quantity: 3,
      }).getValue();

      const primitives = item.toPrimitives();
      expect(primitives.subtotal.amount).toBe(300);
      expect(primitives.quantity).toBe(3);
      expect(primitives.id).toBe('oi_1');
    });
  });
});
