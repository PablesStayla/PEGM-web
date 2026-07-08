import { db, orderItems, orders, products } from '@pranakaia/infrastructure/db';
import { Result } from '@pranakaia/shared-kernel';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export interface DashboardMetrics {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  conversionRate: number; // Mocked for now
}

export interface SalesOverTime {
  date: string;
  revenue: number;
  orders: number;
}

export class ReportingService {
  /**
   * Retrieves high-level dashboard metrics for a date range.
   */
  async getDashboardMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<Result<DashboardMetrics, Error>> {
    try {
      const result = await db
        .select({
          totalRevenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
          orderCount: sql<number>`COUNT(*)`,
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, startDate),
            lte(orders.createdAt, endDate),
            eq(orders.status, 'PAID'), // Only count paid orders
          ),
        );

      const stats = result[0] || { totalRevenue: 0, orderCount: 0 };
      const aov = stats.orderCount > 0 ? stats.totalRevenue / stats.orderCount : 0;

      return Result.ok({
        totalRevenue: Number(stats.totalRevenue),
        orderCount: Number(stats.orderCount),
        averageOrderValue: Number(aov),
        conversionRate: 2.4, // Industry average mock
      });
    } catch (error) {
      logger.error('ReportingService.getDashboardMetrics error', { error });
      return Result.err(
        error instanceof Error ? error : new Error('Failed to get dashboard metrics'),
      );
    }
  }

  /**
   * Retrieves sales aggregated by day.
   */
  async getSalesOverTime(startDate: Date, endDate: Date): Promise<Result<SalesOverTime[], Error>> {
    try {
      const result = await db
        .select({
          date: sql<string>`DATE_TRUNC('day', ${orders.createdAt})::date`,
          revenue: sql<number>`SUM(${orders.total})`,
          orders: sql<number>`COUNT(*)`,
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, startDate),
            lte(orders.createdAt, endDate),
            eq(orders.status, 'PAID'),
          ),
        )
        .groupBy(sql`DATE_TRUNC('day', ${orders.createdAt})`)
        .orderBy(sql`DATE_TRUNC('day', ${orders.createdAt})`);

      return Result.ok(
        result.map((r) => ({
          date: r.date,
          revenue: Number(r.revenue),
          orders: Number(r.orders),
        })),
      );
    } catch (error) {
      logger.error('ReportingService.getSalesOverTime error', { error });
      return Result.err(
        error instanceof Error ? error : new Error('Failed to get sales over time'),
      );
    }
  }

  /**
   * Retrieves top selling products.
   */
  async getTopProducts(limit = 5): Promise<Result<any[], Error>> {
    try {
      const result = await db
        .select({
          productId: orderItems.productId,
          name: products.name,
          totalQuantity: sql<number>`SUM(${orderItems.quantity})`,
          totalRevenue: sql<number>`SUM(${orderItems.subtotal})`,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .groupBy(orderItems.productId, products.name)
        .orderBy(sql`SUM(${orderItems.subtotal}) DESC`)
        .limit(limit);

      return Result.ok(result);
    } catch (error) {
      logger.error('ReportingService.getTopProducts error', { error });
      return Result.err(error instanceof Error ? error : new Error('Failed to get top products'));
    }
  }
}
