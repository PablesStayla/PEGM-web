import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  type Brand,
  createCategoryId,
  createCustomerId,
  createInventoryId,
  createOrderId,
  createPaymentId,
  createProductId,
  createSessionId,
  createSupplierId,
} from './branded';

describe('Branded ID Creators - Business Entities', () => {
  describe('createSupplierId', () => {
    it('should create valid SupplierId', () => {
      const result = createSupplierId('supplier_123');

      expect(result.success).toBe(true);
      expect(result.value).toBe('supplier_123');
    });

    it('should reject empty string', () => {
      const result = createSupplierId('');

      expect(result.success).toBe(false);
    });
  });

  describe('createCustomerId', () => {
    it('should create valid CustomerId', () => {
      const result = createCustomerId('customer_123');

      expect(result.success).toBe(true);
      expect(result.value).toBe('customer_123');
    });

    it('should reject empty string', () => {
      const result = createCustomerId('');

      expect(result.success).toBe(false);
    });
  });

  describe('createCategoryId', () => {
    it('should create valid CategoryId', () => {
      const result = createCategoryId('category_123');

      expect(result.success).toBe(true);
      expect(result.value).toBe('category_123');
    });

    it('should reject empty string', () => {
      const result = createCategoryId('');

      expect(result.success).toBe(false);
    });
  });
});

describe('Branded ID Creators - Session & Payment', () => {
  describe('createSessionId', () => {
    it('should create valid SessionId', () => {
      const result = createSessionId('session_123');

      expect(result.success).toBe(true);
      expect(result.value).toBe('session_123');
    });

    it('should reject empty string', () => {
      const result = createSessionId('');

      expect(result.success).toBe(false);
    });
  });

  describe('createPaymentId', () => {
    it('should create valid PaymentId', () => {
      const result = createPaymentId('payment_123');

      expect(result.success).toBe(true);
      expect(result.value).toBe('payment_123');
    });

    it('should reject empty string', () => {
      const result = createPaymentId('');

      expect(result.success).toBe(false);
    });
  });

  describe('createInventoryId', () => {
    it('should create valid InventoryId', () => {
      const result = createInventoryId('inventory_123');

      expect(result.success).toBe(true);
      expect(result.value).toBe('inventory_123');
    });

    it('should reject empty string', () => {
      const result = createInventoryId('');

      expect(result.success).toBe(false);
    });
  });
});

describe('Branded Types - Error Handling', () => {
  describe('error messages', () => {
    it('should include entity name in error message', () => {
      const result = createProductId('');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('ProductId');
    });

    it('should have correct error code', () => {
      const result = createOrderId('');

      expect(result.error?.code).toBe('INVALID_BRANDED_ID');
    });

    it('should include context with entity and raw value', () => {
      const result = createProductId('');

      expect(result.error?.context).toMatchObject({
        entity: 'ProductId',
        raw: '',
      });
    });
  });
});

describe('Branded Types - Type Safety', () => {
  describe('type safety', () => {
    it('should prevent assignment of plain string', () => {
      const branded: Brand<string, 'ProductId'> = 'test' as Brand<string, 'ProductId'>;
      expectTypeOf(branded).toEqualTypeOf<Brand<string, 'ProductId'>>();
    });

    it('should allow branded types to be used as strings', () => {
      const productId = createProductId('prod_123');

      if (productId.success) {
        const id: string = productId.value;
        expect(id).toBe('prod_123');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle special characters', () => {
      const result = createProductId('prod_123-abc_def');

      expect(result.success).toBe(true);
    });

    it('should handle unicode characters', () => {
      const result = createProductId('prod_ñandú');

      expect(result.success).toBe(true);
    });

    it('should handle very long IDs', () => {
      const longId = `prod_${'a'.repeat(1000)}`;
      const result = createProductId(longId);

      expect(result.success).toBe(true);
      expect(result.value).toBe(longId);
    });

    it('should handle single character IDs', () => {
      const result = createProductId('a');

      expect(result.success).toBe(true);
    });
  });
});
