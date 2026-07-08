import { Money } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it } from 'vitest';
import { Cart } from '../domain/entities/cart.entity';
import type { CartId } from '../domain/entities/cart-id.vo';
import { CartItem, type CartItemId } from '../domain/entities/cart-item.vo';
import { CartExpired } from '../domain/events/cart.events';

describe('Cart Entity - State', () => {
  const createTestCartId = (): CartId => `cart_test_${Date.now()}` as CartId;

  describe('expiration', () => {
    it('should not be expired on creation', () => {
      const cartId = createTestCartId();
      const result = Cart.create({ id: cartId, customerId: 'customer-1' });

      if (result.success) {
        expect(result.value.isExpired()).toBe(false);
      }
    });

    it('should be expired after expire() call', () => {
      const cartId = createTestCartId();
      const result = Cart.create({ id: cartId, customerId: 'customer-1' });

      if (result.success) {
        result.value.expire();
        expect(result.value.isExpired()).toBe(true);
      }
    });

    it('should emit CartExpired event', () => {
      const cartId = createTestCartId();
      const result = Cart.create({ id: cartId, customerId: 'customer-1' });

      if (result.success) {
        result.value.clearEvents();
        result.value.expire();

        expect(result.value.events).toHaveLength(1);
        expect(result.value.events[0]).toBeInstanceOf(CartExpired);
      }
    });
  });
});

describe('Cart Entity - Calculations', () => {
  const createTestCartId = (): CartId => `cart_test_${Date.now()}` as CartId;
  let cart: Cart;

  beforeEach(() => {
    const cartId = createTestCartId();
    const result = Cart.create({ id: cartId, customerId: 'customer-1' });
    if (result.success) {
      cart = result.value;
    }
  });

  it('should calculate subtotal', () => {
    const item1Result = CartItem.create({
      id: 'item_1' as CartItemId,
      productId: 'product-1',
      name: 'Product 1',
      sku: 'TEST-001',
      unitPrice: Money.of(100, 'USD').getValue(),
      quantity: 2,
    });

    const item2Result = CartItem.create({
      id: 'item_2' as CartItemId,
      productId: 'product-2',
      name: 'Product 2',
      sku: 'TEST-002',
      unitPrice: Money.of(50, 'USD').getValue(),
      quantity: 3,
    });

    if (!item1Result.success || !item2Result.success) {
      return;
    }

    cart.addItem(item1Result.value);
    cart.addItem(item2Result.value);

    expect(cart.subtotal.amount).toBe(350);
  });

  it('should return zero subtotal for empty cart', () => {
    expect(cart.subtotal.amount).toBe(0);
  });

  it('should count total items', () => {
    const item1Result = CartItem.create({
      id: 'item_1' as CartItemId,
      productId: 'product-1',
      name: 'Product 1',
      sku: 'TEST-001',
      unitPrice: Money.of(100, 'USD').getValue(),
      quantity: 2,
    });

    const item2Result = CartItem.create({
      id: 'item_2' as CartItemId,
      productId: 'product-2',
      name: 'Product 2',
      sku: 'TEST-002',
      unitPrice: Money.of(50, 'USD').getValue(),
      quantity: 3,
    });

    if (!item1Result.success || !item2Result.success) {
      return;
    }

    cart.addItem(item1Result.value);
    cart.addItem(item2Result.value);

    expect(cart.itemCount).toBe(5);
    expect(cart.uniqueItemCount).toBe(2);
  });

  it('should return zero itemCount for empty cart', () => {
    expect(cart.itemCount).toBe(0);
    expect(cart.uniqueItemCount).toBe(0);
  });

  it('should be empty when no items', () => {
    expect(cart.isEmpty()).toBe(true);

    const itemResult = CartItem.create({
      id: 'item_1' as CartItemId,
      productId: 'product-1',
      name: 'Product 1',
      sku: 'TEST-001',
      unitPrice: Money.of(100, 'USD').getValue(),
      quantity: 1,
    });

    if (!itemResult.success) {
      return;
    }
    const item = itemResult.value;

    cart.addItem(item);
    expect(cart.isEmpty()).toBe(false);
  });
});

describe('Cart Entity - Serialization', () => {
  const createTestCartId = (): CartId => `cart_test_${Date.now()}` as CartId;

  it('should return plain object representation', () => {
    const cartId = createTestCartId();
    const result = Cart.create({ id: cartId, customerId: 'customer-1' });

    if (result.success) {
      const primitives = result.value.toPrimitives();

      expect(primitives.id).toBe(cartId);
      expect(primitives.customerId).toBe('customer-1');
      expect(primitives.sessionId).toBeNull();
      expect(primitives.currency).toBe('USD');
      expect(primitives.items).toEqual([]);
      expect(primitives.subtotal).toEqual({ amount: 0, currency: 'USD' });
      expect(primitives.itemCount).toBe(0);
      expect(primitives.uniqueItemCount).toBe(0);
      expect(primitives.isEmpty).toBe(true);
      expect(typeof primitives.expiresAt).toBe('string');
      expect(typeof primitives.createdAt).toBe('string');
    }
  });
});
