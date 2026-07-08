import type { Metadata } from 'next';
import { ProductList } from '@/resources/products/ProductList';
import { getAdminProductsQuery } from '@/resources/products/queries';

export const metadata: Metadata = {
  title: 'Productos | Admin - PranaKaia',
  description: 'Gestión de productos',
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    active?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const filters = {
    page,
    pageSize: 20,
    ...(sp.sortBy && { sortBy: sp.sortBy }),
    ...(sp.sortOrder && { sortOrder: sp.sortOrder as 'asc' | 'desc' }),
    ...(sp.category && { category: sp.category }),
    ...(sp.search && { search: sp.search }),
    ...(sp.active === 'true' && { status: 'PUBLISHED' }),
    ...(sp.active === 'false' && { status: 'DRAFT' }),
  };

  const result = await getAdminProductsQuery(filters);

  if (result.error) {
    return (
      <ProductList products={result.products} pagination={result.pagination} error={result.error} />
    );
  }

  const totalProducts = result.products.length;
  const activeProducts = result.products.filter((p) => p.status === 'PUBLISHED').length;
  const totalStock = result.products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
  const lowStockCount = result.products.filter(
    (p) => p.stockQuantity && p.stockQuantity < 10,
  ).length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Productos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Total Productos</p>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Activos</p>
          <p className="text-2xl font-bold">{activeProducts}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Stock Total</p>
          <p className="text-2xl font-bold">{totalStock}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Stock Bajo (&lt;10)</p>
          <p className="text-2xl font-bold">{lowStockCount}</p>
        </div>
      </div>

      <ProductList products={result.products} pagination={result.pagination} />
    </div>
  );
}
