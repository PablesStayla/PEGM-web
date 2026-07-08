'use server';

import { categories, db, productImages, products } from '@pranakaia/infrastructure/db';
import { and, asc, desc, eq, ilike, inArray, or } from 'drizzle-orm';

export type StoreProductFilters = {
  category?: string;
  search?: string;
  featured?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'featured';
  limit?: number;
  offset?: number;
};

export async function getStoreProducts(filters?: StoreProductFilters) {
  try {
    const conditions: Parameters<typeof and>[0][] = [eq(products.status, 'PUBLISHED')];

    if (filters?.category) {
      conditions.push(eq(categories.slug, filters.category));
    }

    if (filters?.featured) {
      conditions.push(eq(products.isFeatured, true));
    }

    if (filters?.search) {
      conditions.push(
        or(ilike(products.name, `%${filters.search}%`), ilike(products.sku, `%${filters.search}%`)),
      );
    }

    const orderBy =
      filters?.sortBy === 'price_asc'
        ? asc(products.basePrice)
        : filters?.sortBy === 'price_desc'
          ? desc(products.basePrice)
          : filters?.sortBy === 'featured'
            ? desc(products.isFeatured)
            : desc(products.createdAt);

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        shortDescription: products.shortDescription,
        description: products.description,
        basePrice: products.basePrice,
        salePrice: products.salePrice,
        sku: products.sku,
        status: products.status,
        isFeatured: products.isFeatured,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        conditions.length > 0
          ? and(...(conditions as NonNullable<Parameters<typeof and>[0]>[]))
          : undefined,
      )
      .orderBy(orderBy)
      .limit(filters?.limit ?? 50)
      .offset(filters?.offset ?? 0);

    // Get primary images
    const productIds = rows.map((r) => r.id);
    const images =
      productIds.length > 0
        ? await db
            .select({
              productId: productImages.productId,
              url: productImages.url,
              altText: productImages.altText,
            })
            .from(productImages)
            .where(
              and(inArray(productImages.productId, productIds), eq(productImages.isMain, true)),
            )
        : [];

    const imageMap = new Map(images.map((img) => [img.productId, img]));

    const data = rows.map((row) => ({
      ...row,
      price: row.basePrice,
      images: imageMap.get(row.id)
        ? [{ url: imageMap.get(row.id)!.url, alt: imageMap.get(row.id)!.altText }]
        : [],
    }));

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products',
      data: null,
    };
  }
}

export async function getStoreProductById(id: string) {
  try {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        shortDescription: products.shortDescription,
        description: products.description,
        basePrice: products.basePrice,
        salePrice: products.salePrice,
        sku: products.sku,
        status: products.status,
        isFeatured: products.isFeatured,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.id, id), eq(products.status, 'PUBLISHED')));

    const product = result[0];
    if (!product) {
      return { success: false, error: 'Product not found', data: null };
    }

    const images = await db
      .select({
        url: productImages.url,
        altText: productImages.altText,
        isMain: productImages.isMain,
      })
      .from(productImages)
      .where(eq(productImages.productId, id));

    return {
      success: true,
      data: {
        ...product,
        price: product.basePrice,
        images: images.map((img) => ({ url: img.url, alt: img.altText, isMain: img.isMain })),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product',
      data: null,
    };
  }
}
