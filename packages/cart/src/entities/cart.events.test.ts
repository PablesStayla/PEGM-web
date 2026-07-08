import { describe, expect, it } from 'vitest';
import {
  CartCheckedOut,
  CartCleared,
  CartCreated,
  CartExpired,
  ItemAddedToCart,
  ItemQuantityUpdated,
  ItemRemovedFromCart,
} from '../domain/events/cart.events';

describe('Cart Domain Events - Cart Lifecycle', () => {
  describe('CartCreated', () => {
    it('should create event with customerId', () => {
      const event = new CartCreated('cart-1', 'customer-1', null);

      expect(event.type).toBe('CartCreated');
      expect(event.aggregateId).toBe('cart-1');
      expect(event.customerId).toBe('customer-1');
      expect(event.sessionId).toBeNull();
      expect(event.version).toBe(1);
      expect(event.occurredAt).toBeInstanceOf(Date);
    });

    it('should create event with sessionId', () => {
      const event = new CartCreated('cart-1', null, 'session-1');

      expect(event.customerId).toBeNull();
      expect(event.sessionId).toBe('session-1');
    });

    it('should accept both customerId and sessionId', () => {
      const event = new CartCreated('cart-1', 'customer-1', 'session-1');

      expect(event.customerId).toBe('customer-1');
      expect(event.sessionId).toBe('session-1');
    });
  });

  describe('CartCleared', () => {
    it('should create event', () => {
      const event = new CartCleared('cart-1');

      expect(event.type).toBe('CartCleared');
      expect(event.aggregateId).toBe('cart-1');
    });
  });

  describe('CartExpired', () => {
    it('should create event', () => {
      const event = new CartExpired('cart-1');

      expect(event.type).toBe('CartExpired');
      expect(event.aggregateId).toBe('cart-1');
    });
  });

  describe('CartCheckedOut', () => {
    it('should create event with orderId', () => {
      const event = new CartCheckedOut('cart-1', 'order-123');

      expect(event.type).toBe('CartCheckedOut');
      expect(event.aggregateId).toBe('cart-1');
      expect(event.orderId).toBe('order-123');
    });
  });
});

describe('Cart Domain Events - Item Operations', () => {
  describe('ItemAddedToCart', () => {
    it('should create event with item details', () => {
      const event = new ItemAddedToCart('cart-1', 'product-1', 2, 99.99);

      expect(event.type).toBe('ItemAddedToCart');
      expect(event.aggregateId).toBe('cart-1');
      expect(event.productId).toBe('product-1');
      expect(event.quantity).toBe(2);
      expect(event.unitPrice).toBe(99.99);
    });

    it('should handle quantity of 1', () => {
      const event = new ItemAddedToCart('cart-1', 'product-1', 1, 50);

      expect(event.quantity).toBe(1);
    });

    it('should handle zero unit price', () => {
      const event = new ItemAddedToCart('cart-1', 'product-1', 1, 0);

      expect(event.unitPrice).toBe(0);
    });
  });

  describe('ItemRemovedFromCart', () => {
    it('should create event with product details', () => {
      const event = new ItemRemovedFromCart('cart-1', 'product-1', 3);

      expect(event.type).toBe('ItemRemovedFromCart');
      expect(event.aggregateId).toBe('cart-1');
      expect(event.productId).toBe('product-1');
      expect(event.quantity).toBe(3);
    });

    it('should handle removal of single item', () => {
      const event = new ItemRemovedFromCart('cart-1', 'product-1', 1);

      expect(event.quantity).toBe(1);
    });
  });

  describe('ItemQuantityUpdated', () => {
    it('should create event with old and new quantity', () => {
      const event = new ItemQuantityUpdated('cart-1', 'product-1', 2, 5);

      expect(event.type).toBe('ItemQuantityUpdated');
      expect(event.aggregateId).toBe('cart-1');
      expect(event.productId).toBe('product-1');
      expect(event.oldQuantity).toBe(2);
      expect(event.newQuantity).toBe(5);
    });

    it('should handle decrease in quantity', () => {
      const event = new ItemQuantityUpdated('cart-1', 'product-1', 5, 3);

      expect(event.oldQuantity).toBe(5);
      expect(event.newQuantity).toBe(3);
    });

    it('should handle increase in quantity', () => {
      const event = new ItemQuantityUpdated('cart-1', 'product-1', 1, 10);

      expect(event.oldQuantity).toBe(1);
      expect(event.newQuantity).toBe(10);
    });
  });
});
