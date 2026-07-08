import {
  db,
  orderItems,
  type orderStatusEnum,
  orders as ordersTable,
  products,
  users,
  withRLS,
} from '@pranakaia/infrastructure/db';
import { OrderStatusUpdateEmail, sendEmail } from '@pranakaia/infrastructure/email';
import { NotFoundError, Result } from '@pranakaia/shared-kernel';
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { ADMIN_AUDIT_EVENTS, logAdminAuditEvent } from '@/lib/security/audit';

export interface OrderFilters {
  search?: string | undefined;
  status?: string | undefined;
  paymentStatus?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

const ORDER_STATUS_LABELS: Record<(typeof orderStatusEnum.enumValues)[number], string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  PROCESSING: 'Procesando',
  FULFILLING: 'En preparación',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
  REFUNDED: 'Reembolsada',
  FAILED: 'Fallida',
};

const MAX_ORDERS_CSV_EXPORT = 5000;

export class OrderService {
  /**
   * Retrieves paginated admin orders.
   */
  async getAdminOrders(filters: OrderFilters): Promise<Result<any, Error>> {
    try {
      const {
        search,
        status,
        paymentStatus,
        page = 1,
        pageSize = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      const where = this.buildWhereClause({ search, status, paymentStatus });
      const orderBy = this.resolveSort(sortBy, sortOrder);

      const result = await db.transaction(async (tx) => {
        const [orders, totalResult] = await Promise.all([
          tx
            .select({
              id: ordersTable.id,
              orderNumber: ordersTable.orderNumber,
              status: ordersTable.status,
              paymentStatus: ordersTable.paymentStatus,
              totalAmount: ordersTable.total,
              guestEmail: ordersTable.guestEmail,
              createdAt: ordersTable.createdAt,
              customer: {
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
              },
            })
            .from(ordersTable)
            .leftJoin(users, eq(ordersTable.userId, users.id))
            .where(where)
            .orderBy(orderBy)
            .limit(pageSize)
            .offset((page - 1) * pageSize),
          tx
            .select({ count: count() })
            .from(ordersTable)
            .leftJoin(users, eq(ordersTable.userId, users.id))
            .where(where),
        ]);
        return { orders, total: totalResult[0]?.count || 0 };
      });

      return Result.ok({
        items: result.orders,
        total: result.total,
        page,
        pageSize,
        totalPages: Math.ceil(result.total / pageSize),
      });
    } catch (error) {
      logger.error('OrderService.getAdminOrders error', { error });
      return Result.err(error instanceof Error ? error : new Error('Failed to get orders'));
    }
  }

  /**
   * Retrieves a single order by ID.
   */
  async getOrderById(orderId: string): Promise<Result<any, Error>> {
    try {
      const result = await db.transaction(async (tx) => {
        const order = await tx
          .select()
          .from(ordersTable)
          .leftJoin(users, eq(ordersTable.userId, users.id))
          .where(eq(ordersTable.id, orderId))
          .limit(1);

        if (!order.length) {
          throw new NotFoundError('Order');
        }

        const items = await tx
          .select({
            id: orderItems.id,
            name: products.name,
            quantity: orderItems.quantity,
            unitPrice: orderItems.unitPrice,
            subtotal: orderItems.subtotal,
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, orderId));

        return { order: order[0], items };
      });

      return Result.ok({
        ...result.order!.orders,
        customer: result.order!.users,
        items: result.items,
      });
    } catch (error) {
      logger.error('OrderService.getOrderById error', { orderId, error });
      return Result.err(error instanceof Error ? error : new Error('Failed to get order detail'));
    }
  }

  /**
   * Cancels an order.
   * Only possible if not SHIPPED or DELIVERED.
   */
  async cancelOrder(
    orderId: string,
    adminId: string,
    reason?: string,
  ): Promise<Result<any, Error>> {
    try {
      const result = await withRLS(adminId, 'postgres', async (tx) => {
        const [order] = await tx
          .select({
            id: ordersTable.id,
            status: ordersTable.status,
            orderNumber: ordersTable.orderNumber,
            guestEmail: ordersTable.guestEmail,
            customerEmail: users.email,
          })
          .from(ordersTable)
          .leftJoin(users, eq(ordersTable.userId, users.id))
          .where(eq(ordersTable.id, orderId))
          .limit(1);

        if (!order) {
          throw new NotFoundError('Order');
        }

        if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
          return Result.err<any, Error>(new Error('Cannot cancel a shipped or delivered order'));
        }

        await tx
          .update(ordersTable)
          .set({
            status: 'CANCELLED',
            updatedAt: new Date(),
          })
          .where(eq(ordersTable.id, orderId));

        return Result.ok<any, Error>(order);
      });

      if (!result.success) {
        return result;
      }

      const order = result.value;

      // Notify customer
      const email = order.customerEmail || order.guestEmail;
      if (email) {
        const emailContent = OrderStatusUpdateEmail({
          orderNumber: order.orderNumber,
          status: 'CANCELLED',
        });
        await sendEmail({
          to: email,
          subject: `Orden #${order.orderNumber} Cancelada`,
          body: `Tu orden #${order.orderNumber} ha sido cancelada.`,
          html: emailContent.html,
        }).catch((e) => logger.warn('Failed to send cancel email', { error: e }));
      }

      await logAdminAuditEvent({
        eventType: ADMIN_AUDIT_EVENTS.ORDER_STATUS_CHANGED,
        userId: adminId,
        resource: 'orders',
        action: 'cancel_order',
        metadata: { orderId, reason },
      });

      return Result.ok({ id: orderId, status: 'CANCELLED' });
    } catch (error) {
      logger.error('OrderService.cancelOrder error', { orderId, error });
      return Result.err(error instanceof Error ? error : new Error('Failed to cancel order'));
    }
  }

  /**
   * Processes a refund.
   * Usually restricted to superadmin via action-provider.
   */
  async refundOrder(
    orderId: string,
    adminId: string,
    amount?: number,
  ): Promise<Result<any, Error>> {
    try {
      await withRLS(adminId, 'postgres', async (tx) => {
        const [order] = await tx
          .select()
          .from(ordersTable)
          .where(eq(ordersTable.id, orderId))
          .limit(1);

        if (!order) {
          throw new NotFoundError('Order');
        }

        await tx
          .update(ordersTable)
          .set({
            status: 'REFUNDED',
            paymentStatus: 'REFUNDED',
            updatedAt: new Date(),
          })
          .where(eq(ordersTable.id, orderId));

        return order;
      });

      await logAdminAuditEvent({
        eventType: ADMIN_AUDIT_EVENTS.ORDER_STATUS_CHANGED,
        userId: adminId,
        resource: 'orders',
        action: 'refund_order',
        metadata: { orderId, amount },
      });

      return Result.ok({ id: orderId, status: 'REFUNDED' });
    } catch (error) {
      logger.error('OrderService.refundOrder error', { orderId, error });
      return Result.err(error instanceof Error ? error : new Error('Failed to refund order'));
    }
  }

  /**
   * Updates order status and notifies customer.
   */
  async updateOrderStatus(params: {
    orderId: string;
    status: string;
    adminId: string;
    trackingNumber?: string | undefined;
    trackingUrl?: string | undefined;
    note?: string | undefined;
  }): Promise<Result<any, Error>> {
    const { orderId, status, adminId, trackingNumber, trackingUrl } = params;

    try {
      const nextStatus = status.toUpperCase() as (typeof orderStatusEnum.enumValues)[number];

      const updatedOrder = await withRLS(adminId, 'postgres', async (tx) => {
        const [currentOrder] = await tx
          .select({
            id: ordersTable.id,
            orderNumber: ordersTable.orderNumber,
            guestEmail: ordersTable.guestEmail,
            customerEmail: users.email,
            customerFirstName: users.firstName,
            customerLastName: users.lastName,
          })
          .from(ordersTable)
          .leftJoin(users, eq(ordersTable.userId, users.id))
          .where(eq(ordersTable.id, orderId))
          .limit(1);

        if (!currentOrder) {
          throw new NotFoundError('Order');
        }

        await tx
          .update(ordersTable)
          .set({
            status: nextStatus,
            trackingNumber: trackingNumber || undefined,
            trackingUrl: trackingUrl || undefined,
            updatedAt: new Date(),
          })
          .where(eq(ordersTable.id, orderId));

        return currentOrder;
      });

      // Notification logic
      const recipientEmail = updatedOrder.customerEmail || updatedOrder.guestEmail;
      let emailNotificationSent = false;

      if (recipientEmail) {
        const subjectStatusLabel = ORDER_STATUS_LABELS[nextStatus] ?? nextStatus;

        try {
          const emailContent = OrderStatusUpdateEmail({
            orderNumber: updatedOrder.orderNumber,
            status: nextStatus,
          });
          await sendEmail({
            to: recipientEmail,
            subject: `Actualización de tu orden #${updatedOrder.orderNumber}: ${subjectStatusLabel}`,
            body: `El estado de tu orden #${updatedOrder.orderNumber} ha sido actualizado a ${subjectStatusLabel}.`,
            html: emailContent.html,
          });
          emailNotificationSent = true;
        } catch (e) {
          logger.warn('Failed to send order status email', { orderId, error: e });
        }
      }

      await logAdminAuditEvent({
        eventType: ADMIN_AUDIT_EVENTS.ORDER_STATUS_CHANGED,
        userId: adminId,
        resource: 'orders',
        action: 'update_order_status',
        metadata: { orderId, status: nextStatus, emailNotificationSent },
      });

      return Result.ok({ id: orderId, status: nextStatus, emailNotificationSent });
    } catch (error) {
      logger.error('OrderService.updateOrderStatus error', { orderId, error });
      return Result.err(
        error instanceof Error ? error : new Error('Failed to update order status'),
      );
    }
  }

  /**
   * Exports orders to CSV.
   */
  async exportOrdersCsv(filters: OrderFilters, adminId: string): Promise<Result<any, Error>> {
    try {
      const where = this.buildWhereClause(filters);
      const orderBy = this.resolveSort(filters.sortBy || 'createdAt', filters.sortOrder || 'desc');

      const rows = await withRLS(adminId, 'postgres', async (tx) =>
        tx
          .select({
            id: ordersTable.id,
            orderNumber: ordersTable.orderNumber,
            status: ordersTable.status,
            paymentStatus: ordersTable.paymentStatus,
            totalAmount: ordersTable.total,
            guestEmail: ordersTable.guestEmail,
            createdAt: ordersTable.createdAt,
            customerFirstName: users.firstName,
            customerLastName: users.lastName,
            customerEmail: users.email,
          })
          .from(ordersTable)
          .leftJoin(users, eq(ordersTable.userId, users.id))
          .where(where)
          .orderBy(orderBy)
          .limit(MAX_ORDERS_CSV_EXPORT + 1),
      );

      const truncated = rows.length > MAX_ORDERS_CSV_EXPORT;
      const exportRows = truncated ? rows.slice(0, MAX_ORDERS_CSV_EXPORT) : rows;

      const csvHeaders = [
        'id',
        'order_number',
        'status',
        'payment_status',
        'total',
        'customer',
        'email',
        'date',
      ];
      const csvBody = exportRows.map((o: any) =>
        [
          o.id,
          o.orderNumber,
          o.status,
          o.paymentStatus,
          o.totalAmount,
          `${o.customerFirstName || ''} ${o.customerLastName || ''}`.trim(),
          o.customerEmail || o.guestEmail || '',
          o.createdAt.toISOString(),
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(','),
      );

      const csvContent = `\uFEFF${[csvHeaders.join(','), ...csvBody].join('\n')}`;

      await logAdminAuditEvent({
        eventType: ADMIN_AUDIT_EVENTS.ORDER_CSV_EXPORTED,
        userId: adminId,
        resource: 'orders',
        action: 'export_orders_csv',
        metadata: { count: exportRows.length, filters },
      });

      return Result.ok({
        csvContent,
        filename: `ordenes-${new Date().toISOString().split('T')[0]}.csv`,
        count: exportRows.length,
        truncated,
      });
    } catch (error) {
      logger.error('OrderService.exportOrdersCsv error', { error });
      return Result.err(error instanceof Error ? error : new Error('Failed to export orders'));
    }
  }

  private buildWhereClause(filters: any) {
    const whereConditions = [];
    if (filters.search) {
      whereConditions.push(
        or(
          ilike(ordersTable.id, `%${filters.search}%`),
          ilike(ordersTable.orderNumber, `%${filters.search}%`),
          ilike(ordersTable.guestEmail, `%${filters.search}%`),
          ilike(users.firstName, `%${filters.search}%`),
          ilike(users.lastName, `%${filters.search}%`),
        ),
      );
    }
    if (filters.status && filters.status !== 'all') {
      whereConditions.push(eq(ordersTable.status, filters.status));
    }
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      whereConditions.push(eq(ordersTable.paymentStatus, filters.paymentStatus));
    }
    return whereConditions.length > 0 ? and(...whereConditions) : undefined;
  }

  private resolveSort(sortBy: string, sortOrder: 'asc' | 'desc') {
    const column = (ordersTable as any)[sortBy] || ordersTable.createdAt;
    return sortOrder === 'desc' ? desc(column) : asc(column);
  }
}
