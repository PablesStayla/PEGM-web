import { faker } from '@faker-js/faker';
import { createMockProduct } from './product.factory';
import type { CreateProductOptions } from './product-factory.types';

/** Create a seed/genetics product. */
export function createSeedProduct(options: Omit<CreateProductOptions, 'category'> = {}) {
  return createMockProduct({ ...options, category: 'seeds' });
}

/** Create a grow light product. */
export function createLightProduct(options: Omit<CreateProductOptions, 'category'> = {}) {
  return createMockProduct({ ...options, category: 'lights' });
}

/** Create a kit product. */
export function createKitProduct(options: Omit<CreateProductOptions, 'category'> = {}) {
  return createMockProduct({ ...options, category: 'kits' });
}

/** Create a product with a supplier (dropship). */
export function createDropshipProduct(options: CreateProductOptions = {}) {
  return createMockProduct({
    ...options,
    supplierId: options.supplierId ?? faker.string.uuid(),
  });
}

/** Create a product with a specific discount percentage. */
export function createDiscountedProduct(
  discountPercent: number,
  options: CreateProductOptions = {},
) {
  if (discountPercent <= 0 || discountPercent >= 100) {
    throw new RangeError('discountPercent must be between 1 and 99 (exclusive)');
  }
  const compareAtPrice = options.price ?? faker.number.int({ min: 10_000, max: 200_000 });
  const price = Math.round(compareAtPrice * (1 - discountPercent / 100));
  return createMockProduct({ ...options, price, compareAtPrice } as CreateProductOptions & {
    compareAtPrice: number;
  });
}

/** Create an out-of-stock product. */
export function createOutOfStockProduct(options: Omit<CreateProductOptions, 'inStock'> = {}) {
  return createMockProduct({ ...options, inStock: false });
}
