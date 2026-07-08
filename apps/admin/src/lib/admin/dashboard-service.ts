import {
  auditLogs as auditLogsTable,
  customers as customersTable,
  orderItems as orderItemsTable,
  orders as ordersTable,
  products as productsTable,
  users as usersTable,
} from '@pranakaia/infrastructure/db';
import { and, count, desc, eq, gte, ilike, lte, or, type SQL, sql } from 'drizzle-orm';
import { db } from '@/lib/db';

/**
 * 📊 DashboardService
 * Capa de abstracción para consultas administrativas de alto nivel.
 * Centraliza el acceso a datos para reportes, actividad y gestión de clientes.
 */
export const DashboardService = {
  /**
   * Obtener eventos de actividad recientes (últimos 7 días)
   */
  async getActivityEvents(_limit = 40) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    try {
      const [recentOrders, recentProducts, recentCustomers, recentAuditLogs] = await Promise.all([
        db
          .select({
            id: ordersTable.id,
            orderNumber: ordersTable.orderNumber,
            status: ordersTable.status,
            total: ordersTable.total,
            guestEmail: ordersTable.guestEmail,
            createdAt: ordersTable.createdAt,
          })
          .from(ordersTable)
          .where(gte(ordersTable.createdAt, since) as SQL<unknown>)
          .orderBy(desc(ordersTable.createdAt))
          .limit(20),
        db
          .select({
            id: productsTable.id,
            name: productsTable.name,
            status: productsTable.status,
            createdAt: productsTable.createdAt,
          })
          .from(productsTable)
          .where(gte(productsTable.createdAt, since) as SQL<unknown>)
          .orderBy(desc(productsTable.createdAt))
          .limit(10),
        db
          .select({
            id: usersTable.id,
            email: usersTable.email,
            createdAt: usersTable.createdAt,
          })
          .from(usersTable)
          .where(and(eq(usersTable.role, 'USER'), gte(usersTable.createdAt, since)) as SQL<unknown>)
          .orderBy(desc(usersTable.createdAt))
          .limit(10),
        db
          .select({
            id: auditLogsTable.id,
            eventType: auditLogsTable.action,
            resource: auditLogsTable.entityType,
            action: auditLogsTable.action,
            severity: auditLogsTable.severity,
            createdAt: auditLogsTable.createdAt,
          })
          .from(auditLogsTable)
          .where(gte(auditLogsTable.createdAt, since) as SQL<unknown>)
          .orderBy(desc(auditLogsTable.createdAt))
          .limit(20),
      ]);

      return {
        recentOrders,
        recentProducts,
        recentCustomers,
        recentAuditLogs,
      };
    } catch (error) {
      console.error('[DashboardService.getActivityEvents]', error);
      throw error;
    }
  },

  /**
   * Obtener lista de clientes con métricas agregadas
   */
  async getCustomers(search?: string, limit = 50) {
    const whereConditions = [eq(usersTable.role, 'USER')];

    if (search) {
      whereConditions.push(
        or(
          ilike(usersTable.firstName, `%${search}%`),
          ilike(usersTable.lastName, `%${search}%`),
          ilike(usersTable.email, `%${search}%`),
        ) as SQL<unknown>,
      );
    }

    const where = and(...whereConditions);

    try {
      const [customers, totalResult] = await Promise.all([
        db
          .select({
            id: usersTable.id,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
            email: usersTable.email,
            phone: usersTable.phone,
            createdAt: usersTable.createdAt,
            orderCount: count(ordersTable.id),
            totalSpent: sql<number>`COALESCE(SUM(${ordersTable.total}), 0)`,
          })
          .from(usersTable)
          .leftJoin(ordersTable, eq(usersTable.id, ordersTable.userId))
          .where(where)
          .groupBy(usersTable.id)
          .orderBy(desc(usersTable.createdAt))
          .limit(limit),
        db.select({ count: count() }).from(usersTable).where(where),
      ]);

      return {
        customers: customers.map((c) => ({
          ...c,
          orderCount: Number(c.orderCount),
          totalSpent: Number(c.totalSpent),
        })),
        total: totalResult[0]?.count || 0,
      };
    } catch (error) {
      console.error('[DashboardService.getCustomers]', error);
      throw error;
    }
  },

  /**
   * Obtener datos financieros para reportes
   */
  async getReportsData() {
    const now = new Date();
    const start30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const start90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    try {
      const [revenue30, revenue90, topProducts, statusBreakdown, totalCustomers] =
        await Promise.all([
          db
            .select({
              total: sql<number>`coalesce(sum(${ordersTable.total}), 0)`,
              count: sql<number>`count(*)`,
            })
            .from(ordersTable)
            .where(
              and(
                gte(ordersTable.createdAt, start30),
                lte(ordersTable.createdAt, now),
              ) as SQL<unknown>,
            ),
          db
            .select({
              total: sql<number>`coalesce(sum(${ordersTable.total}), 0)`,
              count: sql<number>`count(*)`,
            })
            .from(ordersTable)
            .where(
              and(
                gte(ordersTable.createdAt, start90),
                lte(ordersTable.createdAt, now),
              ) as SQL<unknown>,
            ),
          db
            .select({
              name: productsTable.name,
              sku: productsTable.sku,
              qty: sql<number>`coalesce(sum(${orderItemsTable.quantity}), 0)`,
              revenue: sql<number>`coalesce(sum(${orderItemsTable.quantity} * ${orderItemsTable.unitPrice}), 0)`,
            })
            .from(orderItemsTable)
            .innerJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
            .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
            .where(gte(ordersTable.createdAt, start30) as SQL<unknown>)
            .groupBy(productsTable.id, productsTable.name, productsTable.sku)
            .orderBy(desc(sql`sum(${orderItemsTable.quantity})`))
            .limit(10),
          db
            .select({
              status: ordersTable.status,
              count: sql<number>`count(*)`,
              revenue: sql<number>`coalesce(sum(${ordersTable.total}), 0)`,
            })
            .from(ordersTable)
            .where(gte(ordersTable.createdAt, start30) as SQL<unknown>)
            .groupBy(ordersTable.status),
          db.select({ count: sql<number>`count(*)` }).from(customersTable),
        ]);

      return {
        revenue30: Number(revenue30[0]?.total ?? 0),
        orders30: Number(revenue30[0]?.count ?? 0),
        revenue90: Number(revenue90[0]?.total ?? 0),
        orders90: Number(revenue90[0]?.count ?? 0),
        topProducts,
        statusBreakdown,
        totalCustomers: Number(totalCustomers[0]?.count ?? 0),
      };
    } catch (error) {
      console.error('[DashboardService.getReportsData]', error);
      throw error;
    }
  },
};
