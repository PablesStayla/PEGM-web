import { ProductIdHelper } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it } from 'vitest';
import { Product } from '../domain/entities/product.entity';
import { Money } from '../domain/value-objects/money.vo';
import { SKU } from '../domain/value-objects/sku.vo';

const createTestProduct = (overrides?: Partial<{ stockQuantity: number }>) => ({
  id: ProductIdHelper.generate(),
  sku: SKU.create('TEST-SKU-001').value!,
  name: 'Test Product',
  description: 'This is a test product description',
  price: Money.create(100, 'USD').value!,
  stockQuantity: overrides?.stockQuantity ?? 10,
});

describe('Product Entity - Lifecycle', () => {
  let product: Product;

  beforeEach(() => {
    const result = Product.create(createTestProduct());
    if (result.success) {
      product = result.value;
    }
  });

  describe('Publish/Archive', () => {
    it('should publish successfully', () => {
      const result = product.publish();

      expect(result.success).toBe(true);
      expect(product.status).toBe('ACTIVE');
    });

    it('should archive successfully', () => {
      const result = product.archive();

      expect(result.success).toBe(true);
      expect(product.status).toBe('ARCHIVED');
    });

    it('should reject publish when stock is zero', () => {
      product.updateStock(0);
      const result = product.publish();

      expect(result.success).toBe(false);
    });
  });
});

describe('Product Entity - Collections', () => {
  let product: Product;

  beforeEach(() => {
    const result = Product.create(createTestProduct());
    if (result.success) {
      product = result.value;
    }
  });

  describe('Category Management', () => {
    it('should add category', () => {
      product.addCategory('cat-123');

      expect(product.categoryIds).toContain('cat-123');
    });

    it('should not add duplicate category', () => {
      product.addCategory('cat-123');
      product.addCategory('cat-123');

      expect(product.categoryIds.filter((id) => id === 'cat-123')).toHaveLength(1);
    });

    it('should remove category', () => {
      product.addCategory('cat-123');
      product.removeCategory('cat-123');

      expect(product.categoryIds).not.toContain('cat-123');
    });
  });

  describe('Image Management', () => {
    it('should add image', () => {
      product.addImage('https://example.com/image1.jpg');

      expect(product.images).toContain('https://example.com/image1.jpg');
    });

    it('should not add duplicate image', () => {
      product.addImage('https://example.com/image1.jpg');
      product.addImage('https://example.com/image1.jpg');

      expect(product.images.filter((url) => url === 'https://example.com/image1.jpg')).toHaveLength(
        1,
      );
    });
  });
});
