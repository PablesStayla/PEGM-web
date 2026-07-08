export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { InventoryList } from '@/resources/inventory/InventoryList';
import { getInventoryStatsQuery, getLowStockProductsQuery } from '@/resources/inventory/queries';
import { getAdminProductsQuery } from '@/resources/products/queries';

export const metadata: Metadata = {
  title: 'Inventario | Admin - PranaKaia',
  description: 'Gestión de inventario y stock',
};

export default async function InventoryPage() {
  const [stats, lowStockProducts, products] = await Promise.all([
    getInventoryStatsQuery(),
    getLowStockProductsQuery(10),
    getAdminProductsQuery({ page: 1, pageSize: 100 }),
  ]);

  return (
    <InventoryList stats={stats} lowStockProducts={lowStockProducts} products={products.products} />
  );
}
