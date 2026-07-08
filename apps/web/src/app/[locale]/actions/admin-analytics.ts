'use server';

import { db, orders, products, users } from '@pranakaia/infrastructure/db';
import { count, eq, gt, or, sql } from 'drizzle-orm';

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  activeProducts: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  // Total Revenue (excluding cancelled/failed operations)
  const revenueResult = await db
    .select({
      totalRevenue: sql<number>`SUM(CASE WHEN ${orders.status} NOT IN ('CANCELLED', 'FAILED') THEN ${orders.total} ELSE 0 END)`,
    })
    .from(orders);
  const totalRevenue = revenueResult[0]?.totalRevenue;

  // Total Orders count
  const ordersResult = await db
    .select({ totalOrders: count() })
    .from(orders)
    .where(sql`${orders.status} NOT IN ('CANCELLED', 'FAILED')`);
  const totalOrders = ordersResult[0]?.totalOrders;

  // Total Customers (excluding SUPER_ADMINs)
  const customersResult = await db
    .select({ totalCustomers: count() })
    .from(users)
    .where(eq(users.role, 'USER'));
  const totalCustomers = customersResult[0]?.totalCustomers;

  // Active Products inside catalog
  const productsResult = await db
    .select({ activeProducts: count() })
    .from(products)
    .where(or(eq(products.status, 'PUBLISHED'), gt(products.stockQuantity, 0)));
  const activeProducts = productsResult[0]?.activeProducts;

  return {
    totalRevenue: Number(totalRevenue || 0),
    totalOrders: Number(totalOrders || 0),
    totalCustomers: Number(totalCustomers || 0),
    activeProducts: Number(activeProducts || 0),
  };
}

export async function getRevenueOverTime(days = 30): Promise<RevenueDataPoint[]> {
  const safeDays = Number.isFinite(days) ? Math.min(Math.max(Math.trunc(days), 1), 365) : 30;

  // Query to sum up order totals grouped by date (YYYY-MM-DD)
  const revenueData = await db
    .select({
      date: sql<string>`DATE_TRUNC('day', ${orders.createdAt})::date::text`,
      revenue: sql<number>`SUM(${orders.total})`,
    })
    .from(orders)
    .where(
      sql`${orders.createdAt} >= NOW() - (${safeDays} * INTERVAL '1 day')
      AND ${orders.status} NOT IN ('CANCELLED', 'FAILED')`,
    )
    .groupBy(sql`DATE_TRUNC('day', ${orders.createdAt})::date`)
    .orderBy(sql`DATE_TRUNC('day', ${orders.createdAt})::date ASC`);

  return revenueData.map((d) => ({
    date: d.date,
    revenue: Number(d.revenue || 0),
  }));
}
