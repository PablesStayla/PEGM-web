import { describe, expect, it } from 'vitest';
import { Cart } from '../domain/entities/cart.entity';
import type { CartId } from '../domain/entities/cart-id.vo';
import { CartCreated } from '../domain/events/cart.events';

describe('Cart Entity - Creation', () => {
  const createTestCartId = (): CartId => `cart_test_${Date.now()}` as CartId;

  it('should create cart with customerId', () => {
    const cartId = createTestCartId();
    const result = Cart.create({ id: cartId, customerId: 'customer-1' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.idValue).toBe(cartId);
      expect(result.value.customerId).toBe('customer-1');
    }
  });

  it('should create cart with sessionId', () => {
    const cartId = createTestCartId();
    const result = Cart.create({ id: cartId, sessionId: 'session-1' });

    expect(result.success).toBe(true);
  });

  it('should fail without customerId or sessionId', () => {
    const cartId = createTestCartId();
    const result = Cart.create({ id: cartId });

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('customerId or sessionId');
  });

  it('should set default currency to USD', () => {
    const cartId = createTestCartId();
    const result = Cart.create({ id: cartId, customerId: 'customer-1' });

    if (result.success) {
      expect(result.value.currency).toBe('USD');
    }
  });

  it('should accept custom currency', () => {
    const cartId = createTestCartId();
    const result = Cart.create({ id: cartId, customerId: 'customer-1', currency: 'EUR' });

    if (result.success) {
      expect(result.value.currency).toBe('EUR');
    }
  });

  it('should set default expiration to 30 days', () => {
    const cartId = createTestCartId();
    const before = Date.now();
    const result = Cart.create({ id: cartId, customerId: 'customer-1' });
    const after = Date.now() + 30 * 24 * 60 * 60 * 1000;

    if (result.success) {
      const expiresTime = result.value.expiresAt.getTime();
      expect(expiresTime).toBeGreaterThanOrEqual(before);
      expect(expiresTime).toBeLessThanOrEqual(after);
    }
  });

  it('should accept custom expiration date', () => {
    const cartId = createTestCartId();
    const customExpires = new Date('2025-12-31');
    const result = Cart.create({
      id: cartId,
      customerId: 'customer-1',
      expiresAt: customExpires,
    });

    if (result.success) {
      expect(result.value.expiresAt).toEqual(customExpires);
    }
  });

  it('should emit CartCreated event', () => {
    const cartId = createTestCartId();
    const result = Cart.create({ id: cartId, customerId: 'customer-1' });

    if (result.success) {
      const events = result.value.events;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(CartCreated);
    }
  });
});
