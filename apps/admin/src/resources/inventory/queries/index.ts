'use server';

/**
 * Inventory Queries for RSC
 */

import 'server-only';
import { container } from '@/providers/container';
import { unwrapAsync } from '@/providers/data/result-bridge';

export interface InventoryStats {
  totalStock: number;
  activeProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalProducts: number;
  totalValue: number;
}

export async function getInventoryStatsQuery(): Promise<InventoryStats> {
  return await unwrapAsync(container.inventoryService.getInventoryStats());
}

export async function getLowStockProductsQuery(limit: number = 10): Promise<
  Array<{
    id: string;
    name: string;
    slug: string;
    stockQuantity: number | null;
  }>
> {
  return (await unwrapAsync(container.inventoryService.getLowStockProducts(limit))) as any;
}
