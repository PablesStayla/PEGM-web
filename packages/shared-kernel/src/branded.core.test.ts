import { describe, expect, expectTypeOf, it } from 'vitest';
import { type Brand, createCartId, createOrderId, createProductId, createUserId } from './branded';

describe('Branded Types - Core', () => {
  describe('Brand type', () => {
    it('should create branded type', () => {
      const productId: Brand<string, 'ProductId'> = 'prod_123' as Brand<string, 'ProductId'>;

      expectTypeOf(productId).toEqualTypeOf<Brand<string, 'ProductId'>>();
      expect(productId).toBe('prod_123');
    });

    it('should prevent mixing different branded types', () => {
      const productId = 'prod_123' as Brand<string, 'ProductId'>;
      const orderId = 'order_456' as Brand<string, 'OrderId'>;

      expectTypeOf(productId).not.toEqualTypeOf<typeof orderId>();
    });
  });
});

describe('Branded ID Creators - Product', () => {
  describe('createProductId', () => {
    it('should create valid ProductId', () => {
      const result = createProductId('prod_123');

      expect(result.success).toBe(true);
      expect(result.value).toBe('prod_123');
    });

    it('should trim and validate', () => {
      const result = createProductId(' prod_123 ');

      expect(result.success).toBe(true);
      expect(result.value).toBe('prod_123');
    });

    it('should reject empty string', () => {
      const result = createProductId('');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('INVALID_BRANDED_ID');
    });

    it('should reject whitespace-only string', () => {
      const result = createProductId(' ');

      expect(result.success).toBe(false);
    });

    it('should reject undefined', () => {
      const result = createProductId(undefined as unknown as string);

      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = createProductId(null as unknown as string);

      expect(result.success).toBe(false);
    });
  });
});

describe('Branded ID Creators - Order', () => {
  describe('createOrderId', () => {
    it('should create valid OrderId', () => {
      const result = createOrderId('order_123');

      expect(result.success).toBe(true);
      expect(result.value).toBe('order_123');
    });

    it('should reject empty string', () => {
      const result = createOrderId('');

      expect(result.success).toBe(false);
    });

    it('should preserve type safety', () => {
      const result = createOrderId('order_123');

      if (result.success) {
        expectTypeOf(result.value).toEqualTypeOf<Brand<string, 'OrderId'>>();
      }
    });
  });
});

describe('Branded ID Creators - User & Cart', () => {
  describe('createUserId', () => {
    it('should create valid UserId', () => {
      const result = createUserId('user_123');

      expect(result.success).toBe(true);
      expect(result.value).toBe('user_123');
    });

    it('should reject empty string', () => {
      const result = createUserId('');

      expect(result.success).toBe(false);
    });
  });

  describe('createCartId', () => {
    it('should create valid CartId', () => {
      const result = createCartId('cart_123');

      expect(result.success).toBe(true);
      expect(result.value).toBe('cart_123');
    });

    it('should reject empty string', () => {
      const result = createCartId('');

      expect(result.success).toBe(false);
    });
  });
});
