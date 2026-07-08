import { ProductIdHelper } from '@pranakaia/shared-kernel';
import { describe, expect, it } from 'vitest';
import { Product } from '../domain/entities/product.entity';
import { ProductCreated } from '../domain/events/product.events';
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

describe('Product Entity - Creation', () => {
  describe('Creation', () => {
    it('should create a valid product', () => {
      const props = createTestProduct();
      const result = Product.create(props);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.name).toBe('Test Product');
        expect(result.value.sku.value).toBe('TEST-SKU-001');
        expect(result.value.price.amount).toBe(100);
      }
    });

    it('should emit ProductCreated event on creation', () => {
      const props = createTestProduct();
      const result = Product.create(props);

      if (result.success) {
        const events = result.value.getUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(ProductCreated);
      }
    });

    it('should set status to ACTIVE when stock > 0', () => {
      const props = createTestProduct({ stockQuantity: 10 });
      const result = Product.create(props);

      if (result.success) {
        expect(result.value.status).toBe('ACTIVE');
        expect(result.value.isAvailable).toBe(true);
      }
    });

    it('should set status to OUT_OF_STOCK when stock = 0', () => {
      const props = createTestProduct({ stockQuantity: 0 });
      const result = Product.create(props);

      if (result.success) {
        expect(result.value.status).toBe('OUT_OF_STOCK');
        expect(result.value.isAvailable).toBe(false);
      }
    });

    it('should fail with invalid name', () => {
      const props = {
        ...createTestProduct(),
        name: 'A',
      };
      const result = Product.create(props);

      expect(result.success).toBe(false);
    });

    it('should fail with invalid description', () => {
      const props = {
        ...createTestProduct(),
        description: 'Short',
      };
      const result = Product.create(props);

      expect(result.success).toBe(false);
    });
  });
});

describe('Product Entity - Serialization', () => {
  it('should serialize to primitives', () => {
    const props = createTestProduct();
    const result = Product.create(props);

    if (result.success) {
      const primitives = result.value.toPrimitives();

      expect(primitives.id).toBe(props.id);
      expect(primitives.sku).toBe('TEST-SKU-001');
      expect(primitives.name).toBe('Test Product');
      expect(primitives.price).toEqual({ amount: 100, currency: 'USD' });
    }
  });
});
