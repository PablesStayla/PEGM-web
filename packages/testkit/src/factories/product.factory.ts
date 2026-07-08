/**
 * @file Product Factory
 */

import { faker } from '@faker-js/faker';
import { GROWSHOP_PRODUCTS } from './product-factory.constants';
import type { CreateProductOptions, ProductCategory, TestProduct } from './product-factory.types';

export * from './product-factory.types';

/**
 * Create a single mock product.
 */
export function createMockProduct(options: CreateProductOptions = {}): TestProduct {
  const { category, name } = resolveCategoryAndName(options);
  const price = options.price ?? faker.number.int({ min: 5_000, max: 500_000 });
  const compareAtPrice = getCompareAtPrice(price, options);

  const sku =
    options.sku ??
    `PK-${category.toUpperCase().slice(0, 3)}-${faker.string.alphanumeric(6).toUpperCase()}`;

  const { supplierId, supplierSku, dropshipEnabled } = getSupplierInfo(options.supplierId);

  return {
    id: faker.string.uuid(),
    name,
    slug: name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, ''),
    sku,
    description: faker.commerce.productDescription(),
    price,
    compareAtPrice,
    costPrice: Math.round(price * 0.6),
    currency: 'CLP',
    category,
    inStock: options.inStock ?? true,
    stockQuantity: faker.number.int({ min: 0, max: 500 }),
    lowStockThreshold: 5,
    images: [
      'https://images.unsplash.com/photo-1582215682845?w=800',
      'https://images.unsplash.com/photo-1416879598555?w=800',
    ],
    tags: faker.helpers.arrayElements(
      ['organico', 'premium', 'bestseller', 'nuevo', 'indoor', 'hidroponia'],
      { min: 1, max: 3 },
    ),
    weight: faker.number.float({ min: 0.1, max: 25, fractionDigits: 2 }),
    dimensions: {
      length: faker.number.float({ min: 5, max: 100, fractionDigits: 1 }),
      width: faker.number.float({ min: 5, max: 100, fractionDigits: 1 }),
      height: faker.number.float({ min: 5, max: 100, fractionDigits: 1 }),
    },
    supplierId,
    supplierSku,
    dropshipEnabled,
    seo: {
      title: name,
      description: faker.commerce.productDescription().slice(0, 160),
      keywords: faker.helpers.arrayElements(
        ['cultivo', 'indoor', 'growshop', 'chile', 'led', 'hidroponia'],
        3,
      ),
    },
    metadata: {},
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent({ days: 30 }),
  };
}

function resolveCategoryAndName(options: CreateProductOptions) {
  const categories = Object.keys(GROWSHOP_PRODUCTS) as ProductCategory[];
  const category = options.category ?? faker.helpers.arrayElement(categories);
  const name = options.name ?? faker.helpers.arrayElement(GROWSHOP_PRODUCTS[category]);
  return { category, name };
}

function getCompareAtPrice(price: number, options: CreateProductOptions) {
  if (options.compareAtPrice !== undefined) {
    return options.compareAtPrice;
  }
  const hasSale = faker.datatype.boolean({ probability: 0.3 });
  return hasSale
    ? Math.round(price * faker.number.float({ min: 1.1, max: 1.5, fractionDigits: 1 }))
    : undefined;
}

function getSupplierInfo(supplierId: string | null | undefined) {
  if (!supplierId) {
    return { supplierId: null, supplierSku: null, dropshipEnabled: false };
  }
  return {
    supplierId,
    supplierSku: faker.string.alphanumeric(8).toUpperCase(),
    dropshipEnabled: true,
  };
}

/** Create multiple mock products. */
export function createMockProducts(
  count: number,
  options: CreateProductOptions = {},
): TestProduct[] {
  return Array.from({ length: count }, () => createMockProduct(options));
}

export * from './product-factory.creators';
