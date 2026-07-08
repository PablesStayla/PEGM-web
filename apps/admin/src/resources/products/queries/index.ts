'use server';

/**
 * Product Queries for RSC
 */

import 'server-only';
import { container } from '@/providers/container';
import { unwrapAsync } from '@/providers/data/result-bridge';
import type { AdminProductFilters } from '../schemas';

export interface ProductQueryResult {
  products: Array<{
    id: string;
    sku: string;
    name: string;
    slug: string;
    description: string | null;
    basePrice: number;
    salePrice: number | null;
    stockQuantity: number;
    status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | 'OUT_OF_STOCK';
    isFeatured: boolean;
    createdAt: Date;
    category: {
      id: string;
      name: string;
    };
  }>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function getAdminProductsQuery(
  filters?: AdminProductFilters,
): Promise<ProductQueryResult> {
  const result = await unwrapAsync<any, Error>(
    container.adminProductService.getAdminProducts((filters || {}) as any),
  );

  return {
    products: result.data || [],
    pagination: result.pagination,
  };
}

export async function getCategoriesQuery(): Promise<Array<{ id: string; name: string }>> {
  return await unwrapAsync<any, Error>(container.adminProductService.getCategories());
}
