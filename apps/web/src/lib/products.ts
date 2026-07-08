/**
 * @file apps/web/src/lib/products.ts
 *
 * Data access layer for products. Uses Next.js unstable_cache for ISR/ISG
 * with granular tag-based revalidation.
 *
 * All functions in this file should be called from Server Components or
 * Server Actions. Do NOT import this module on the client side.
 */

import {
  type Product as ProductEntity,
  type ProductSearchParams,
  ProductService,
} from '@pranakaia/catalog';
import { db } from '@pranakaia/infrastructure/db';
import { slugify } from '@pranakaia/shared-kernel';
import { unstable_cache } from 'next/cache';
import { DrizzleProductRepository } from '@/infrastructure/repositories/drizzle-product-repository';
import type { Product } from '@/types';
import { CACHE_DURATION, CACHE_TAGS } from './cache-tags';
import { createLogger } from './logger';

const log = createLogger({ module: 'products' });

// Singleton instances reused across requests in the same process
const productRepo = new DrizzleProductRepository();
const productService = new ProductService(productRepo, async (fn) => db.transaction(fn));

// ── Cache key versioning ────────────────────────────────────────────────────────
// Bump the version number when the Product shape changes to avoid stale cache.
const CACHE_VERSION = 'v6';

// ── Mapper ───────────────────────────────────────────────────────────────────

/**
 * Map a CoreProduct domain entity to the UI Product type.
 * Exported for unit-testing.
 */
export function mapCoreToUI(p: ReturnType<ProductEntity['toPrimitives']>): Product {
  const toAmount = (value: unknown): number | undefined => {
    if (typeof value === 'number') {
      return value;
    }
    if (
      typeof value === 'object' &&
      value !== null &&
      'amount' in value &&
      typeof (value as { amount: unknown }).amount === 'number'
    ) {
      return (value as { amount: number }).amount;
    }
    return undefined;
  };

  // Core-domain uses Money objects; we keep a numeric fallback for legacy fixtures.
  const basePrice = toAmount(p.price) ?? 0;

  // originalPrice should be set when there IS a sale price (i.e. the list
  // price before discount), not when salePrice is truthy and equal to basePrice.
  const originalPrice = undefined;

  // Current price is the lower of the two
  const currentPrice = basePrice;

  const slug = slugify(p.name);

  return {
    id: p.id,
    name: p.name,
    slug,
    description: p.description ?? '',
    price: currentPrice,
    originalPrice,
    images: p.images ?? [],
    category: p.categoryIds[0] || 'general',
    stock: p.stockQuantity,
    featured: false,
    tags: [],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// ── Data access functions ──────────────────────────────────────────────────────

export const getAllProducts = unstable_cache(
  async (params?: ProductSearchParams): Promise<Product[]> => {
    log.debug('Fetching all products', { params });
    const result = await productService.listProducts(params);
    if (result.isFailure) {
      log.error('Failed to list products', { error: result.errorValue });
      return [];
    }
    const { items } = result.getValue();
    log.debug('Products fetched from domain service', { count: items.length });
    return items.map((p) => mapCoreToUI(p.toPrimitives()));
  },
  [`getAllProducts-${CACHE_VERSION}`],
  {
    revalidate: CACHE_DURATION.REALTIME, // 60s — balances freshness and DB load
    tags: [CACHE_TAGS.products],
  },
);

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  return unstable_cache(
    async () => {
      const products = await getAllProducts();
      return products.find((p) => p.slug === slug) ?? null;
    },
    [`getProductBySlug-${CACHE_VERSION}`, slug],
    {
      revalidate: CACHE_DURATION.STANDARD, // 1 hour
      tags: [CACHE_TAGS.products, CACHE_TAGS.productBySlug(slug)],
    },
  )();
};

export const getProductById = async (id: string): Promise<Product | null> => {
  return unstable_cache(
    async () => {
      const products = await getAllProducts();
      return products.find((p) => p.id === id) ?? null;
    },
    [`getProductById-${CACHE_VERSION}`, id],
    {
      revalidate: CACHE_DURATION.STANDARD,
      tags: [CACHE_TAGS.products, CACHE_TAGS.productById(id)],
    },
  )();
};

export const getFeaturedProducts = async (limit = 8): Promise<Product[]> => {
  return unstable_cache(
    async () => {
      const products = await getAllProducts();
      return products.filter((p) => p.featured).slice(0, limit);
    },
    [`getFeaturedProducts-${CACHE_VERSION}`, String(limit)],
    {
      revalidate: CACHE_DURATION.FAST, // 5 min — featured can change more often
      tags: [CACHE_TAGS.products, CACHE_TAGS.featuredProducts],
    },
  )();
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  return unstable_cache(
    async () => {
      const products = await getAllProducts();
      return products.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    },
    [`getProductsByCategory-${CACHE_VERSION}`, category],
    {
      revalidate: CACHE_DURATION.STANDARD,
      tags: [CACHE_TAGS.products, CACHE_TAGS.productsByCategory(category)],
    },
  )();
};
