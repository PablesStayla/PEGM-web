import {
  categories as categoriesTable,
  orderItems as orderItemsTable,
  orders as ordersTable,
  products as productsTable,
  users as usersTable,
} from '@pranakaia/infrastructure/db';
import { and, eq, gte, inArray, lte, type SQL, sql } from 'drizzle-orm';
import { db } from '@/lib/db';

// ── Dashboard KPIs ──────────────────────────────────────────────────────────
export async function getDashboardMetrics(start: Date, end: Date) {
  try {
    const periodMs = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodMs);
    const prevEnd = start;

    const [
      currentOrders,
      previousOrders,
      totalUsersResult,
      previousUsersResult,
      currentCustomersResult,
      previousCustomersResult,
    ] = await Promise.all([
      db
        .select({ total: ordersTable.total })
        .from(ordersTable)
        .where(
          and(
            gte(ordersTable.createdAt, start),
            lte(ordersTable.createdAt, end),
            inArray(ordersTable.status, ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']),
          ) as SQL<unknown>,
        ),
      db
        .select({ total: ordersTable.total })
        .from(ordersTable)
        .where(
          and(
            gte(ordersTable.createdAt, prevStart),
            lte(ordersTable.createdAt, prevEnd),
            inArray(ordersTable.status, ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']),
          ) as SQL<unknown>,
        ),
      db
        .select({ value: sql<number>`count(*)` })
        .from(usersTable)
        .where(lte(usersTable.createdAt, end) as SQL<unknown>),
      db
        .select({ value: sql<number>`count(*)` })
        .from(usersTable)
        .where(lte(usersTable.createdAt, prevEnd) as SQL<unknown>),
      db
        .select({ value: sql<number>`count(*)` })
        .from(usersTable)
        .where(
          and(
            eq(usersTable.role, 'USER'),
            gte(usersTable.createdAt, start),
            lte(usersTable.createdAt, end),
          ) as SQL<unknown>,
        ),
      db
        .select({ value: sql<number>`count(*)` })
        .from(usersTable)
        .where(
          and(
            eq(usersTable.role, 'USER'),
            gte(usersTable.createdAt, prevStart),
            lte(usersTable.createdAt, prevEnd),
          ) as SQL<unknown>,
        ),
    ]);

    const totalRevenue = currentOrders.reduce((sum, o) => {
      const val = Number(o.total || 0);
      return sum + (Number.isNaN(val) ? 0 : val);
    }, 0);

    const prevRevenue = previousOrders.reduce((sum, o) => {
      const val = Number(o.total || 0);
      return sum + (Number.isNaN(val) ? 0 : val);
    }, 0);

    const totalUsers = Number(totalUsersResult[0]?.value || 0);
    const previousUsers = Number(previousUsersResult[0]?.value || 0);
    const currentCustomers = Number(currentCustomersResult[0]?.value || 0);
    const previousCustomers = Number(previousCustomersResult[0]?.value || 0);

    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersChange =
      previousOrders.length > 0
        ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100
        : 0;
    const usersChange =
      previousUsers > 0 ? ((totalUsers - previousUsers) / previousUsers) * 100 : 0;

    const conversionRate = totalUsers > 0 ? (currentCustomers / totalUsers) * 100 : 0;
    const prevConversionRate = previousUsers > 0 ? (previousCustomers / previousUsers) * 100 : 0;
    const conversionChange = prevConversionRate > 0 ? conversionRate - prevConversionRate : 0;

    return {
      totalRevenue,
      revenueChange: Math.round(revenueChange * 10) / 10,
      totalOrders: currentOrders.length,
      ordersChange: Math.round(ordersChange * 10) / 10,
      totalUsers,
      usersChange: Math.round(usersChange * 10) / 10,
      conversionRate: Math.round(conversionRate * 100) / 100,
      conversionChange: Math.round(conversionChange * 100) / 100,
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return {
      totalRevenue: 0,
      revenueChange: 0,
      totalOrders: 0,
      ordersChange: 0,
      totalUsers: 0,
      usersChange: 0,
      conversionRate: 0,
      conversionChange: 0,
    };
  }
}

// ── Sales Chart Data ────────────────────────────────────────────────────────
export async function getSalesData(start: Date, end: Date, interval: 'day' | 'week' | 'month') {
  try {
    const orders = await db
      .select({
        createdAt: ordersTable.createdAt,
        total: ordersTable.total,
      })
      .from(ordersTable)
      .where(
        and(
          gte(ordersTable.createdAt, start),
          lte(ordersTable.createdAt, end),
          inArray(ordersTable.status, ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']),
        ) as SQL<unknown>,
      )
      .orderBy(ordersTable.createdAt);

    const grouped = new Map<string, { revenue: number; orders: number }>();

    for (const order of orders) {
      const date = order.createdAt;
      let key: string;

      if (interval === 'day') {
        key = date.toISOString().slice(0, 10);
      } else if (interval === 'week') {
        const d = new Date(date);
        d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        key = d.toISOString().slice(0, 10);
      } else {
        key = date.toISOString().slice(0, 7);
      }

      const existing = grouped.get(key) || { revenue: 0, orders: 0 };
      existing.revenue += Number(order.total);
      existing.orders += 1;
      grouped.set(key, existing);
    }

    const result: Array<{ date: string; revenue: number; orders: number }> = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      const data = grouped.get(key) || { revenue: 0, orders: 0 };
      result.push({ date: cursor.toISOString(), ...data });

      if (interval === 'day') {
        cursor.setDate(cursor.getDate() + 1);
      } else if (interval === 'week') {
        cursor.setDate(cursor.getDate() + 7);
      } else {
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }

    return result;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return [];
  }
}

// ── Top Products ────────────────────────────────────────────────────────────
export async function getTopProducts(start: Date, end: Date, limit: number) {
  try {
    const items = await db
      .select({
        productId: orderItemsTable.productId,
        quantity: orderItemsTable.quantity,
        subtotal: orderItemsTable.subtotal,
        productName: productsTable.name,
        categoryName: categoriesTable.name,
      })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id) as SQL<unknown>)
      .innerJoin(productsTable, eq(orderItemsTable.productId, productsTable.id) as SQL<unknown>)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id) as SQL<unknown>)
      .where(
        and(gte(ordersTable.createdAt, start), lte(ordersTable.createdAt, end)) as SQL<unknown>,
      );

    const productMap = new Map<
      string,
      { name: string; revenue: number; unitsSold: number; productId: string; category: string }
    >();

    for (const item of items) {
      const existing = productMap.get(item.productId) || {
        name: item.productName || 'Producto desconocido',
        revenue: 0,
        unitsSold: 0,
        productId: item.productId,
        category: item.categoryName || 'Sin categoría',
      };
      existing.revenue += Number(item.subtotal);
      existing.unitsSold += item.quantity;
      productMap.set(item.productId, existing);
    }

    return [...productMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
      .map((p, i) => ({
        id: String(i + 1),
        name: p.name,
        revenue: Math.round(p.revenue),
        unitsSold: p.unitsSold,
        category: p.category,
      }));
  } catch (error) {
    console.error('Error fetching top products:', error);
    return [];
  }
}
