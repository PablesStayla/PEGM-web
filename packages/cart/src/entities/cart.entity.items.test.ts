import { Money } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it } from 'vitest';
import { Cart } from '../domain/entities/cart.entity';
import type { CartId } from '../domain/entities/cart-id.vo';
import { CartItem, type CartItemId } from '../domain/entities/cart-item.vo';
import { ItemAddedToCart } from '../domain/events/cart.events';

const createTestCartId = (): CartId => `cart_test_${Date.now()}` as CartId;

describe('Cart Entity - Add Items', () => {
  let cart: Cart;

  beforeEach(() => {
    const cartId = createTestCartId();
    const result = Cart.create({ id: cartId, customerId: 'customer-1' });
    if (result.success) {
      cart = result.value;
    }
  });

  describe('addItem', () => {
    it('should add item to empty cart', () => {
      const itemResult = CartItem.create({
        id: 'item-1' as CartItemId,
        productId: 'product-1',
        name: 'Test Product',
        sku: 'TEST-001',
        unitPrice: Money.of(100, 'USD').getValue(),
        quantity: 1,
      });

      if (!itemResult.success) {
        return;
      }
      const item = itemResult.value;

      const result = cart.addItem(item);

      expect(result.success).toBe(true);
      expect(cart.items).toHaveLength(1);
    });

    it('should increase quantity when adding same product', () => {
      const item1Result = CartItem.create({
        id: 'item-1' as CartItemId,
        productId: 'product-1',
        name: 'Test Product',
        sku: 'TEST-001',
        unitPrice: Money.of(100, 'USD').getValue(),
        quantity: 1,
      });

      const item2Result = CartItem.create({
        id: 'item-1' as CartItemId,
        productId: 'product-1',
        name: 'Test Product',
        sku: 'TEST-001',
        unitPrice: Money.of(100, 'USD').getValue(),
        quantity: 2,
      });

      if (!item1Result.success || !item2Result.success) {
        return;
      }
      const item1 = item1Result.value;
      const item2 = item2Result.value;

      cart.addItem(item1);
      cart.addItem(item2);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(3);
    });

    it('should emit ItemAddedToCart event', () => {
      const itemResult = CartItem.create({
        id: 'item-1' as CartItemId,
        productId: 'product-1',
        name: 'Test Product',
        sku: 'TEST-001',
        unitPrice: Money.of(100, 'USD').getValue(),
        quantity: 1,
      });

      if (!itemResult.success) {
        return;
      }
      const item = itemResult.value;

      cart.clearEvents();
      cart.addItem(item);

      const events = cart.events;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ItemAddedToCart);
    });

    it('should fail if cart is expired', () => {
      const itemResult = CartItem.create({
        id: 'item-1' as CartItemId,
        productId: 'product-1',
        name: 'Test Product',
        sku: 'TEST-001',
        unitPrice: Money.of(100, 'USD').getValue(),
        quantity: 1,
      });

      if (!itemResult.success) {
        return;
      }
      const item = itemResult.value;

      cart.expire();
      const result = cart.addItem(item);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('expired');
    });
  });
});
