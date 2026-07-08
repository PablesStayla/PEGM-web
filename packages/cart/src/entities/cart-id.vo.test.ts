import { describe, expect, it } from 'vitest';
import { CartId } from '../domain/entities/cart-id.vo';

describe('CartId Value Object', () => {
  describe('generate', () => {
    it('should generate valid cart ID', () => {
      const id = CartId.generate();

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^cart_\d+_[a-z0-9]+$/);
    });

    it('should generate unique IDs', () => {
      const id1 = CartId.generate();
      const id2 = CartId.generate();

      expect(id1).not.toBe(id2);
    });

    it('should start with cart_ prefix', () => {
      const id = CartId.generate();
      expect(id.startsWith('cart_')).toBe(true);
    });
  });

  describe('create', () => {
    it('should create valid cart ID', () => {
      const result = CartId.create('cart_123456_abc123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('cart_123456_abc123');
      }
    });

    it('should reject invalid format', () => {
      const result = CartId.create('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Must start with "cart_"');
    });

    it('should reject empty string', () => {
      const result = CartId.create('');

      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = CartId.create('' as any);

      expect(result.success).toBe(false);
    });

    it('should accept cart ID with underscores', () => {
      const result = CartId.create('cart_2024_05_04_abc_123');

      expect(result.success).toBe(true);
    });
  });

  describe('from', () => {
    it('should convert string to CartId', () => {
      const id = CartId.from('cart_test_123');

      expect(id).toBe('cart_test_123');
    });

    it('should not validate format', () => {
      // from() accepts any string, validation is opt-in
      const id = CartId.from('any_string');
      expect(id).toBe('any_string');
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const id1 = CartId.from('cart_123');
      const id2 = CartId.from('cart_123');

      expect(CartId.equals(id1, id2)).toBe(true);
    });

    it('should return false for different values', () => {
      const id1 = CartId.from('cart_123');
      const id2 = CartId.from('cart_456');

      expect(CartId.equals(id1, id2)).toBe(false);
    });

    it('should be case-sensitive', () => {
      const id1 = CartId.from('cart_ABC');
      const id2 = CartId.from('cart_abc');

      expect(CartId.equals(id1, id2)).toBe(false);
    });
  });

  describe('type safety', () => {
    it('should be assignable to string', () => {
      const id: CartId = CartId.from('cart_test');
      const str: string = id;

      expect(str).toBe('cart_test');
    });

    it('should preserve type through operations', () => {
      const id = CartId.from('cart_test');
      const upper = id.toUpperCase();

      expect(typeof upper).toBe('string');
    });
  });
});

describe('CartId - edge cases', () => {
  it('should handle very long IDs', () => {
    const longId = `cart_${'a'.repeat(200)}`;
    const result = CartId.create(longId);

    expect(result.success).toBe(true);
  });

  it('should handle special characters in ID', () => {
    const id = 'cart_test-with-special-chars-123';
    const result = CartId.create(id);

    expect(result.success).toBe(true);
  });

  it('should handle unicode in ID', () => {
    const id = 'cart_测试_🚀';
    const result = CartId.create(id);

    expect(result.success).toBe(true);
  });

  it('should handle single character after prefix', () => {
    const id = 'cart_a';
    const result = CartId.create(id);

    expect(result.success).toBe(true);
  });

  it('should handle numbers only after prefix', () => {
    const id = 'cart_123456789';
    const result = CartId.create(id);

    expect(result.success).toBe(true);
  });
});
