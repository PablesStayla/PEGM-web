import { describe, expect, it } from 'vitest';
import { SupplierProductEntity } from './supplier-product.entity';

describe('SupplierProductEntity', () => {
  it('should create and round-trip primitives', () => {
    const result = SupplierProductEntity.create({
      supplierId: 'supplier-1',
      supplierProductId: 'sp-1',
      productId: 'product-1',
      sku: 'SKU-1',
      name: 'Test Product',
      externalUrl: 'https://example.com/item',
    });

    expect(result.isSuccess).toBe(true);
    const entity = result.getValue();
    expect(entity.isActive).toBe(true);
    expect(entity.supplierId).toBe('supplier-1');
    expect(entity.toPrimitives().supplierProductId).toBe('sp-1');
  });
});
