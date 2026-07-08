import { Money } from '@pranakaia/shared-kernel';
import { describe, expect, it } from 'vitest';
import { Cart } from '../domain/entities/cart.entity';
import { CartId } from '../domain/entities/cart-id.vo';
import { CartItem, CartItemIdHelper } from '../domain/entities/cart-item.vo';

const MOCK_CART_ID = CartId.generate();
const MOCK_CUSTOMER_ID = '22222222-2222-2222-2222-222222222222';
const MOCK_PRODUCT_1 = '33333333-3333-3333-3333-333333333333';
const MOCK_PRODUCT_2 = '44444444-4444-4444-4444-444444444444';

const createCartItem = (
  overrides: Partial<{
    productId: string;
    name: string;
    unitPrice: Money;
    quantity: number;
    currency: string;
  }> = {},
): CartItem => {
  const currency = overrides.currency ?? 'USD';
  const priceResult = Money.create(1000, currency);
  if (!priceResult.success) {
    throw priceResult.error;
  }

  const itemResult = CartItem.create({
    id: CartItemIdHelper.generate(),
    productId: overrides.productId ?? MOCK_PRODUCT_1,
    name: overrides.name ?? 'Test Product',
    sku: 'SKU-TEST',
    unitPrice: overrides.unitPrice ?? priceResult.value,
    quantity: overrides.quantity ?? 1,
  });
  if (!itemResult.success) {
    throw itemResult.error;
  }
  return itemResult.value;
};

describe('Cart Entity - Creation', () => {
  describe('Cart', () => {
    it('should create a cart with default values', () => {
      const result = Cart.create({
        id: MOCK_CART_ID,
        customerId: MOCK_CUSTOMER_ID,
      });

      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }

      const cart = result.value;
      expect(cart.customerId).toBe(MOCK_CUSTOMER_ID);
      expect(cart.currency).toBe('USD');
    });

    it('should create a cart with custom currency', () => {
      const result = Cart.create({
        id: MOCK_CART_ID,
        customerId: MOCK_CUSTOMER_ID,
        currency: 'CLP',
      });

      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }

      expect(result.value.currency).toBe('CLP');
    });

    it('should fail without customerId or sessionId', () => {
      const result = Cart.create({ id: MOCK_CART_ID });

      expect(result.success).toBe(false);
    });

    it('should add a item to the cart', () => {
      const cartResult = Cart.create({
        id: MOCK_CART_ID,
        customerId: MOCK_CUSTOMER_ID,
        currency: 'CLP',
      });
      if (!cartResult.success) {
        return;
      }
      const cart = cartResult.value;

      const item = createCartItem({ productId: MOCK_PRODUCT_1, quantity: 2, currency: 'CLP' });
      const addResult = cart.addItem(item);

      expect(addResult.success).toBe(true);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0]!.productId).toBe(MOCK_PRODUCT_1);
      expect(cart.items[0]!.quantity).toBe(2);
    });

    it('should merge quantities when adding an existing item', () => {
      const cartResult = Cart.create({
        id: MOCK_CART_ID,
        customerId: MOCK_CUSTOMER_ID,
        currency: 'CLP',
      });
      if (!cartResult.success) {
        return;
      }
      const cart = cartResult.value;

      const item1 = createCartItem({ productId: MOCK_PRODUCT_1, quantity: 2, currency: 'CLP' });
      cart.addItem(item1);

      const item2 = createCartItem({ productId: MOCK_PRODUCT_1, quantity: 3, currency: 'CLP' });
      const addResult = cart.addItem(item2);

      expect(addResult.success).toBe(true);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0]!.quantity).toBe(5);
    });
  });
});

describe('Cart Entity - Items Management', () => {
  describe('Cart', () => {
    it('should remove an item from the cart', () => {
      const cartResult = Cart.create({
        id: MOCK_CART_ID,
        customerId: MOCK_CUSTOMER_ID,
        currency: 'CLP',
      });
      if (!cartResult.success) {
        return;
      }
      const cart = cartResult.value;

      const item = createCartItem({ productId: MOCK_PRODUCT_1, currency: 'CLP' });
      cart.addItem(item);

      const removeResult = cart.removeItem(item.id);

      expect(removeResult.success).toBe(true);
      expect(cart.items).toHaveLength(0);
    });

    it('should update an item quantity', () => {
      const cartResult = Cart.create({
        id: MOCK_CART_ID,
        customerId: MOCK_CUSTOMER_ID,
        currency: 'CLP',
      });
      if (!cartResult.success) {
        return;
      }
      const cart = cartResult.value;

      const item = createCartItem({ productId: MOCK_PRODUCT_1, quantity: 2, currency: 'CLP' });
      cart.addItem(item);

      const updateResult = cart.updateItemQuantity(item.id, 5);

      expect(updateResult.success).toBe(true);
      expect(cart.items[0]!.quantity).toBe(5);
    });

    it('should clear all items', () => {
      const cartResult = Cart.create({
        id: MOCK_CART_ID,
        customerId: MOCK_CUSTOMER_ID,
        currency: 'CLP',
      });
      if (!cartResult.success) {
        return;
      }
      const cart = cartResult.value;

      cart.addItem(createCartItem({ productId: MOCK_PRODUCT_1, currency: 'CLP' }));
      cart.addItem(createCartItem({ productId: MOCK_PRODUCT_2, currency: 'CLP' }));

      const clearResult = cart.clear();

      expect(clearResult.success).toBe(true);
      expect(cart.items).toHaveLength(0);
    });
  });
});

describe('Cart Entity - Calculations', () => {
  describe('Cart', () => {
    it('should calculate total price', () => {
      const cartResult = Cart.create({
        id: MOCK_CART_ID,
        customerId: MOCK_CUSTOMER_ID,
        currency: 'CLP',
      });
      if (!cartResult.success) {
        return;
      }
      const cart = cartResult.value;

      const item1 = createCartItem({ productId: MOCK_PRODUCT_1, quantity: 2, currency: 'CLP' });
      const item2 = createCartItem({ productId: MOCK_PRODUCT_2, quantity: 1, currency: 'CLP' });
      cart.addItem(item1);
      cart.addItem(item2);

      const total = cart.subtotal;

      expect(total.amount).toBe(3000);
      expect(total.currency).toBe('CLP');
    });

    it('should return zero total for empty cart', () => {
      const cartResult = Cart.create({
        id: MOCK_CART_ID,
        customerId: MOCK_CUSTOMER_ID,
      });
      if (!cartResult.success) {
        return;
      }
      const cart = cartResult.value;

      const total = cart.subtotal;

      expect(total.amount).toBe(0);
    });

    it('should count total items', () => {
      const cartResult = Cart.create({
        id: MOCK_CART_ID,
        customerId: MOCK_CUSTOMER_ID,
      });
      if (!cartResult.success) {
        return;
      }
      const cart = cartResult.value;

      cart.addItem(createCartItem({ productId: MOCK_PRODUCT_1, quantity: 2 }));
      cart.addItem(createCartItem({ productId: MOCK_PRODUCT_2, quantity: 3 }));

      expect(cart.itemCount).toBe(5);
    });
  });
});
