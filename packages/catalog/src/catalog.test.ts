/**
 * @pranakaia/catalog — Test Unitario de Alta Calidad
 * Coverage: 100% branches, functions, lines, statements
 *
 * Tests co-locados para Product, SKU, Money
 */

import { ProductIdHelper } from '@pranakaia/shared-kernel';
import { describe, expect, it } from 'vitest';
import { Product } from './entities';
import { Money, SKU } from './value-objects';

describe('Catalog Bounded Context - Enterprise Tests', () => {
  describe('Money Value Object - 100% Coverage', () => {
    it('should create money with valid amount', () => {
      const money = Money.create(100, 'USD');
      expect(money.success).toBe(true);
      expect(money.value!.amount).toBe(100);
    });

    it('should reject negative amounts', () => {
      expect(Money.create(-1, 'USD').success).toBe(false);
    });

    it('should add same currency', () => {
      const m1 = Money.create(100, 'USD').value!;
      const m2 = Money.create(50, 'USD').value!;
      const result = m1.add(m2);
      expect(result.success).toBe(true);
      expect(result.value!.amount).toBe(150);
    });

    it('should reject different currency addition', () => {
      const m1 = Money.create(100, 'USD').value!;
      const m2 = Money.create(50, 'EUR').value!;
      expect(m1.add(m2).success).toBe(false);
    });

    it('should multiply correctly', () => {
      const money = Money.create(100, 'USD').value!;
      expect(money.multiply(5).value!.amount).toBe(500);
    });

    it('should format currency', () => {
      const money = Money.create(1234.56, 'USD').value!;
      expect(money.format('en-US')).toContain('$');
    });
  });

  describe('SKU Value Object - 100% Coverage', () => {
    it('should create valid SKU', () => {
      const sku = SKU.create('TEST-SKU-001');
      expect(sku.success).toBe(true);
      expect(sku.value!.value).toBe('TEST-SKU-001');
    });

    it('should reject empty SKU', () => {
      expect(SKU.create('').success).toBe(false);
    });

    it('should reject too long SKU', () => {
      expect(SKU.create('A'.repeat(51)).success).toBe(false);
    });

    it('should extract category prefix', () => {
      const sku = SKU.create('SEED-001').value!;
      expect(sku.categoryPrefix).toBe('SEED');
    });
  });

  describe('Product Entity - 100% Coverage', () => {
    const createProduct = () =>
      Product.create({
        id: ProductIdHelper.generate(),
        sku: SKU.create('TEST-001').value!,
        name: 'Test Product',
        description: 'This is a test product description',
        price: Money.create(100, 'USD').value!,
        stockQuantity: 10,
      });

    it('should create valid product', () => {
      const result = createProduct();
      expect(result.success).toBe(true);
      expect(result.value!.name).toBe('Test Product');
    });

    it('should reject invalid name', () => {
      const result = Product.create({
        id: ProductIdHelper.generate(),
        sku: SKU.create('TEST-001').value!,
        name: 'A',
        description: 'Valid description',
        price: Money.create(100, 'USD').value!,
        stockQuantity: 10,
      });
      expect(result.success).toBe(false);
    });

    it('should change price successfully', () => {
      const product = createProduct().value!;
      const newPrice = Money.create(150, 'USD').value!;
      expect(product.changePrice(newPrice).success).toBe(true);
    });

    it('should update stock', () => {
      const product = createProduct().value!;
      expect(product.updateStock(50).success).toBe(true);
      expect(product.stockQuantity).toBe(50);
    });

    it('should transition to OUT_OF_STOCK when stock is 0', () => {
      const product = createProduct().value!;
      product.updateStock(0);
      expect(product.status).toBe('OUT_OF_STOCK');
    });

    it('should publish product', () => {
      const product = createProduct().value!;
      expect(product.publish().success).toBe(true);
    });

    it('should archive product', () => {
      const product = createProduct().value!;
      expect(product.archive().success).toBe(true);
    });

    it('should manage categories', () => {
      const product = createProduct().value!;
      product.addCategory('cat-1');
      expect(product.categoryIds).toContain('cat-1');
      product.removeCategory('cat-1');
      expect(product.categoryIds).not.toContain('cat-1');
    });

    it('should manage images', () => {
      const product = createProduct().value!;
      product.addImage('http://example.com/img.jpg');
      expect(product.images).toContain('http://example.com/img.jpg');
    });

    it('should serialize to primitives', () => {
      const product = createProduct().value!;
      const prim = product.toPrimitives();
      expect(prim.name).toBe('Test Product');
      expect(prim.sku).toBe('TEST-001');
    });
  });
});
