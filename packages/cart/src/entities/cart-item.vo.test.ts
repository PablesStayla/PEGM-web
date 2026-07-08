import { Money } from '@pranakaia/shared-kernel';
import { describe, expect, it } from 'vitest';
import {
  CartItem,
  type CartItemId,
  CartItemValidationError,
} from '../domain/entities/cart-item.vo';

const createTestItem = (overrides?: Partial<Parameters<typeof CartItem.create>[0]>): CartItem => {
  const props = {
    id: `item_${Date.now()}` as CartItemId,
    productId: 'product-1',
    name: 'Test Product',
    sku: 'TEST-001',
    unitPrice: Money.of(100, 'USD').getValue(),
    quantity: 1,
    ...overrides,
  };

  const result = CartItem.create(props);
  if (!result.success) {
    throw result.error;
  }
  return result.value;
};

describe('CartItem Value Object', () => {
  describe('Creation', () => {
    it('should create valid cart item', () => {
      const result = CartItem.create({
        id: 'item_1' as CartItemId,
        productId: 'product-1',
        name: 'Test Product',
        sku: 'TEST-001',
        unitPrice: Money.of(100, 'USD').getValue(),
        quantity: 1,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.productId).toBe('product-1');
        expect(result.value.name).toBe('Test Product');
        expect(result.value.quantity).toBe(1);
      }
    });

    it('should reject quantity <= 0', () => {
      const result = CartItem.create({
        id: 'item_1' as CartItemId,
        productId: 'product-1',
        name: 'Test Product',
        sku: 'TEST-001',
        unitPrice: Money.of(100, 'USD').getValue(),
        quantity: 0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(CartItemValidationError);
    });

    it('should reject invalid imageUrl', () => {
      const result = CartItem.create({
        id: 'item_1' as CartItemId,
        productId: 'product-1',
        name: 'Test Product',
        unitPrice: Money.of(100, 'USD').getValue(),
        quantity: 1,
        imageUrl: 'not-a-url',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(CartItemValidationError);
    });

    it('should reject quantity > 999', () => {
      const result = CartItem.create({
        id: 'item_1' as CartItemId,
        productId: 'product-1',
        name: 'Test Product',
        sku: 'TEST-001',
        unitPrice: Money.of(100, 'USD').getValue(),
        quantity: 1000,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Subtotal', () => {
    it('should calculate subtotal correctly', () => {
      const item = createTestItem({ quantity: 3, unitPrice: Money.of(50, 'USD').getValue() });

      expect(item.subtotal.amount).toBe(150);
      expect(item.subtotal.currency).toBe('USD');
    });

    it('should handle decimal prices', () => {
      const item = createTestItem({ quantity: 2, unitPrice: Money.of(19.99, 'USD').getValue() });

      expect(item.subtotal.amount).toBe(39.98);
    });
  });

  describe('Comparison', () => {
    it('should return true for same item', () => {
      const item = createTestItem();

      expect(item.equals(item)).toBe(true);
    });

    it('should return false for different items', () => {
      const item1 = createTestItem({ productId: 'product-1', sku: 'SKU-1' });
      const item2 = createTestItem({ productId: 'product-2', sku: 'SKU-2' });

      expect(item1.equals(item2)).toBe(false);
    });

    it('should compare by productId and sku', () => {
      const item1 = createTestItem({ productId: 'p1', sku: 's1' });
      const item2 = createTestItem({ productId: 'p1', sku: 's1', name: 'Other' });

      expect(item1.equals(item2)).toBe(true);
    });
  });

  describe('Operations', () => {
    it('should increase quantity', () => {
      const item = createTestItem({ quantity: 1 });
      const result = item.increaseQuantity(2);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.quantity).toBe(3);
      }
    });

    it('should decrease quantity', () => {
      const item = createTestItem({ quantity: 5 });
      const result = item.decreaseQuantity(2);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.quantity).toBe(3);
      }
    });

    it('should fail to decrease quantity below 1', () => {
      const item = createTestItem({ quantity: 1 });
      const result = item.decreaseQuantity(1);

      expect(result.success).toBe(false);
    });
  });

  describe('Serialization', () => {
    it('should return plain object', () => {
      const item = createTestItem({
        productId: 'p1',
        name: 'Product 1',
        quantity: 2,
        unitPrice: Money.of(100, 'USD').getValue(),
      });
      const primitives = item.toPrimitives();

      expect(primitives.productId).toBe('p1');
      expect(primitives.name).toBe('Product 1');
      expect(primitives.quantity).toBe(2);
      expect(primitives.unitPrice).toEqual({ amount: 100, currency: 'USD' });
      expect(primitives.subtotal).toEqual({ amount: 200, currency: 'USD' });
    });
  });
});
