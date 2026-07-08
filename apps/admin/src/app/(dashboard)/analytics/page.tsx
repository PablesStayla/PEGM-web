import {
  orders as ordersTable,
  products as productsTable,
  users,
} from '@pranakaia/infrastructure/db';
import { and, count, eq, gte, lt, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { AnalyticsView } from '@/resources/analytics/AnalyticsView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Analytics | Admin - PranaKaia',
  description: 'Métricas y analytics del negocio',
};

type AnalyticsData = {
  totalOrders: number;
  recentOrders: number;
  orderGrowth: number;
  totalRevenue: number;
  totalCustomers: number;
  recentCustomers: number;
  totalProducts: number;
  activeProducts: number;
  statusMap: Record<string, number>;
};

async function getAnalyticsData(): Promise<AnalyticsData> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalOrdersResult,
    recentOrdersResult,
    previousPeriodOrdersResult,
    totalCustomersResult,
    recentCustomersResult,
    totalProductsResult,
    activeProductsResult,
    ordersByStatus,
    recentOrdersRevenue,
  ] = await Promise.all([
    db.select({ value: count() }).from(ordersTable),
    db
      .select({ value: count() })
      .from(ordersTable)
      .where(gte(ordersTable.createdAt, thirtyDaysAgo)),
    db
      .select({ value: count() })
      .from(ordersTable)
      .where(
        and(gte(ordersTable.createdAt, sixtyDaysAgo), lt(ordersTable.createdAt, thirtyDaysAgo)),
      ),
    db.select({ value: count() }).from(users).where(eq(users.role, 'USER')),
    db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.role, 'USER'), gte(users.createdAt, thirtyDaysAgo))),
    db.select({ value: count() }).from(productsTable),
    db.select({ value: count() }).from(productsTable).where(eq(productsTable.status, 'PUBLISHED')),
    db
      .select({ status: ordersTable.status, value: count() })
      .from(ordersTable)
      .groupBy(ordersTable.status),
    db
      .select({ total: sql<number>`COALESCE(SUM(${ordersTable.total}), 0)` })
      .from(ordersTable)
      .where(gte(ordersTable.createdAt, thirtyDaysAgo)),
  ]);

  const totalOrders = Number(totalOrdersResult[0]?.value || 0);
  const recentOrders = Number(recentOrdersResult[0]?.value || 0);
  const previousPeriodOrders = Number(previousPeriodOrdersResult[0]?.value || 0);
  const totalCustomers = Number(totalCustomersResult[0]?.value || 0);
  const recentCustomers = Number(recentCustomersResult[0]?.value || 0);
  const totalProducts = Number(totalProductsResult[0]?.value || 0);
  const activeProducts = Number(activeProductsResult[0]?.value || 0);
  const totalRevenue = Number(recentOrdersRevenue[0]?.total ?? 0);

  const orderGrowth =
    previousPeriodOrders > 0
      ? ((recentOrders - previousPeriodOrders) / previousPeriodOrders) * 100
      : recentOrders > 0
        ? 100
        : 0;

  const statusMap: Record<string, number> = {};
  for (const s of ordersByStatus) {
    statusMap[String(s.status)] = Number(s.value);
  }

  return {
    totalOrders,
    recentOrders,
    orderGrowth,
    totalRevenue,
    totalCustomers,
    recentCustomers,
    totalProducts,
    activeProducts,
    statusMap,
  };
}

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsData();

  return <AnalyticsView data={data} />;
}
