import { db } from '@pranakaia/db';
import { productsTable } from '@pranakaia/db/schema';
import { Result } from '@pranakaia/shared-kernel';
import { count, eq, lte, sql, sum } from 'drizzle-orm';

/** Aggregated inventory statistics for dashboard reporting. */
export interface InventoryStats {
  totalStock: number;
  activeProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalProducts: number;
  totalValue: number;
}

/** Low-stock product projection for replenishment workflows. */
export interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  stockQuantity: number | null;
}

/**
 * Read-only inventory query service.
 *
 * Encapsulates all inventory reporting queries that do not mutate state.
 * Separated from {@link InventoryService} to keep each class focused and
 * within the 200-line domain limit.
 */
export class InventoryQueryService {
  /**
   * Retrieves aggregated stock statistics across the entire catalog.
   *
   * @returns Snapshot of total stock, active products, low-stock counts, and total value.
   */
  async getStats(): Promise<Result<InventoryStats, Error>> {
    try {
      const [statsResult, statsLowStock, statsOutOfStock] = await Promise.all([
        db
          .select({
            totalStock: sum(productsTable.stockQuantity),
            activeProducts: count(sql`CASE WHEN ${productsTable.status} = 'PUBLISHED' THEN 1 END`),
            totalProducts: count(productsTable.id),
            totalValue: sum(sql`${productsTable.basePrice} * ${productsTable.stockQuantity}`),
          })
          .from(productsTable),
        db
          .select({ value: count() })
          .from(productsTable)
          .where(lte(productsTable.stockQuantity, 10)),
        db.select({ value: count() }).from(productsTable).where(eq(productsTable.stockQuantity, 0)),
      ]);

      const globalStats = statsResult[0];
      const lowStockCount = statsLowStock[0]?.value ?? 0;
      const outOfStockCount = statsOutOfStock[0]?.value ?? 0;

      return Result.ok(mapQueryStats(globalStats, lowStockCount, outOfStockCount));
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error('Failed to get inventory stats'),
      );
    }
  }

  /**
   * Returns products with stock quantity at or below the low-stock threshold (10 units).
   *
   * @param limit - Maximum number of products to return (default: 10).
   */
  async getLowStockProducts(limit = 10): Promise<Result<LowStockProduct[], Error>> {
    try {
      const lowStockProducts = await db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          slug: productsTable.slug,
          stockQuantity: productsTable.stockQuantity,
        })
        .from(productsTable)
        .where(lte(productsTable.stockQuantity, 10))
        .limit(limit);

      return Result.ok(lowStockProducts);
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error('Failed to get low stock products'),
      );
    }
  }
}

function mapQueryStats(
  globalStats:
    | {
        totalStock: string | number | null;
        activeProducts: number;
        totalProducts: number;
        totalValue: string | number | null;
      }
    | undefined,
  lowStockCount: number,
  outOfStockCount: number,
): InventoryStats {
  return {
    totalStock: Number(globalStats?.totalStock || 0),
    activeProducts: Number(globalStats?.activeProducts || 0),
    lowStockCount,
    outOfStockCount,
    totalProducts: Number(globalStats?.totalProducts || 0),
    totalValue: Number(globalStats?.totalValue || 0),
  };
}
