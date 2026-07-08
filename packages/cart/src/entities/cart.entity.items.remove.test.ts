import { Money } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it } from 'vitest';
import { Cart } from '../domain/entities/cart.entity';
import type { CartId } from '../domain/entities/cart-id.vo';
import { CartItem, type CartItemId } from '../domain/entities/cart-item.vo';
import {
  CartCleared,
  ItemQuantityUpdated,
  ItemRemovedFromCart,
} from '../domain/events/cart.events';

const createTestCartId = (): CartId => `cart_test_${Date.now()}` as CartId;

describe('Cart Entity - Remove & Update Items', () => {
  let cart: Cart;
  const itemId: CartItemId = 'item_1' as CartItemId;

  beforeEach(() => {
    const cartId = createTestCartId();
    const result = Cart.create({ id: cartId, customerId: 'customer-1' });
    if (result.success) {
      cart = result.value;
    }

    const itemResult = CartItem.create({
      id: itemId,
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

    cart.addItem(item);
  });

  describe('removeItem', () => {
    it('should remove existing item', () => {
      expect(cart.items).toHaveLength(1);

      const result = cart.removeItem(itemId);

      expect(result.success).toBe(true);
      expect(cart.items).toHaveLength(0);
    });

    it('should fail for non-existent item', () => {
      const result = cart.removeItem('non-existent' as CartItemId);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not found');
    });

    it('should emit ItemRemovedFromCart event', () => {
      cart.clearEvents();
      cart.removeItem(itemId);

      const events = cart.events;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ItemRemovedFromCart);
    });
  });

  describe('updateItemQuantity', () => {
    it('should update quantity', () => {
      const result = cart.updateItemQuantity(itemId, 5);

      expect(result.success).toBe(true);
      expect(cart.items[0].quantity).toBe(5);
    });

    it('should remove item if quantity is zero or negative', () => {
      cart.updateItemQuantity(itemId, 0);
      expect(cart.items).toHaveLength(0);

      const itemResult = CartItem.create({
        id: itemId,
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

      cart.addItem(item);
      cart.updateItemQuantity(itemId, -1);
      expect(cart.items).toHaveLength(0);
    });

    it('should fail for non-existent item', () => {
      const result = cart.updateItemQuantity('non-existent' as CartItemId, 5);

      expect(result.success).toBe(false);
    });

    it('should emit ItemQuantityUpdated event', () => {
      cart.clearEvents();
      cart.updateItemQuantity(itemId, 10);

      const events = cart.events;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ItemQuantityUpdated);
    });
  });
});

describe('Cart Entity - Clear', () => {
  let cart: Cart;

  beforeEach(() => {
    const cartId = createTestCartId();
    const result = Cart.create({ id: cartId, customerId: 'customer-1' });
    if (result.success) {
      cart = result.value;
    }

    const item1Result = CartItem.create({
      id: 'item_1' as CartItemId,
      productId: 'product-1',
      name: 'Product 1',
      sku: 'TEST-001',
      unitPrice: Money.of(100, 'USD').getValue(),
      quantity: 1,
    });

    if (!item1Result.success) {
      return;
    }
    const item1 = item1Result.value;

    const item2Result = CartItem.create({
      id: 'item_2' as CartItemId,
      productId: 'product-2',
      name: 'Product 2',
      sku: 'TEST-002',
      unitPrice: Money.of(50, 'USD').getValue(),
      quantity: 2,
    });

    if (!item2Result.success) {
      return;
    }
    const item2 = item2Result.value;

    cart.addItem(item1);
    cart.addItem(item2);
  });

  describe('clear', () => {
    it('should remove all items', () => {
      expect(cart.items).toHaveLength(2);

      cart.clear();

      expect(cart.items).toHaveLength(0);
    });

    it('should emit CartCleared event', () => {
      cart.clearEvents();
      cart.clear();

      const events = cart.events;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(CartCleared);
    });

    it('should not emit event if cart was already empty', () => {
      cart.clear();
      cart.clearEvents();
      cart.clear();

      expect(cart.events).toHaveLength(0);
    });
  });
});
