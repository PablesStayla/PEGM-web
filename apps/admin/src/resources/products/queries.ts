import { getAdminProducts } from '@/actions/admin-products';
import type { Product } from '@/actions/products/types';

export async function getAdminProductsQuery(params: {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  categoryId?: string;
  status?: string;
}): Promise<{
  products: Product[];
  total: number;
  pagination?: { page: number; pageSize: number; total: number };
  error?: string;
}> {
  const result = await getAdminProducts({
    parsedInput: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc',
      search: params.search,
      categoryId: params.categoryId,
      status: params.status,
    },
  } as never);

  if (!(result as any).success) {
    return {
      products: [],
      total: 0,
      error: (result as any).serverError || 'Error al cargar productos',
    };
  }

  return {
    products: (result as any).data || [],
    total: (result as any).pagination?.total || 0,
    pagination: (result as any).pagination,
  };
}
