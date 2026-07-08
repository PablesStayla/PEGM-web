'use server';

import { db, orderItems, orders, products, users, withRLS } from '@pranakaia/infrastructure/db';
import { and, asc, desc, eq, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { adminActionClient } from '@/lib/safe-action';
import { ADMIN_AUDIT_EVENTS, logAdminAuditEvent } from '@/lib/security/audit';

const ORDER_STATUSes = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'FULFILLING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
  'FAILED',
] as const;
type OrderStatus = (typeof ORDER_STATUSes)[number];

const getAdminOrdersSchema = z.object({
  page: z.number().default(1),
  pageSize: z.number().default(20),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.string().default('all'),
  paymentStatus: z.string().default('all'),
  search: z.string().optional(),
});

const updateOrderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum(ORDER_STATUSes),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
});

const exportOrdersSchema = z.object({
  search: z.string().optional(),
  status: z.string().default('all'),
  paymentStatus: z.string().default('all'),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const getAdminOrdersAction = adminActionClient
  .schema(getAdminOrdersSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { page, pageSize, sortBy, sortOrder, status, paymentStatus, search } = parsedInput;

      const result = await withRLS(async () => {
        const whereConditions = [];
        if (status !== 'all') {
          whereConditions.push(eq(orders.status, status));
        }
        if (paymentStatus !== 'all') {
          whereConditions.push(eq(orders.paymentStatus, paymentStatus));
        }
        if (search) {
          whereConditions.push(
            or(ilike(orders.orderNumber, `%${search}%`), ilike(orders.guestEmail, `%${search}%`)),
          );
        }

        const sortColumn = (orders as any)[sortBy] || orders.createdAt;
        const data = await db
          .select({
            id: orders.id,
            orderNumber: orders.orderNumber,
            status: orders.status,
            paymentStatus: orders.paymentStatus,
            total: orders.total,
            guestEmail: orders.guestEmail,
            createdAt: orders.createdAt,
            customerFirstName: users.firstName,
            customerLastName: users.lastName,
            customerEmail: users.email,
          })
          .from(orders)
          .leftJoin(users, eq(orders.userId, users.id))
          .where(and(...whereConditions))
          .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
          .limit(pageSize)
          .offset((page - 1) * pageSize);

        return data;
      });

      return {
        success: true,
        data: result || [],
        pagination: { page, pageSize, total: result?.length || 0 },
      };
    } catch (error) {
      logger.error('Failed to get admin orders', { error });
      return {
        success: false,
        data: [],
        pagination: { page: parsedInput.page, pageSize: parsedInput.pageSize, total: 0 },
      };
    }
  });

export const updateOrderStatusAction = adminActionClient
  .schema(updateOrderStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.user?.id) {
      throw new Error('Not authenticated');
    }

    const { orderId, status, trackingNumber, trackingUrl } = parsedInput;

    if (!ORDER_STATUSes.includes(status as OrderStatus)) {
      throw new Error('Invalid order status');
    }

    const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order || order.length === 0) {
      logger.error('Order not found', { orderId });
      throw new Error('Order not found');
    }

    await db
      .update(orders)
      .set({
        status,
        trackingNumber: trackingNumber || null,
        trackingUrl: trackingUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    logAdminAuditEvent({
      eventType: ADMIN_AUDIT_EVENTS.ORDER_STATUS_CHANGED,
      userId: ctx.user.id,
      metadata: { orderId, status, previousStatus: order[0]?.status },
    });

    revalidatePath('/admin/orders');

    return { success: true, data: { orderId, status } };
  });

export const exportAdminOrdersCsvAction = adminActionClient
  .schema(exportOrdersSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.user?.id) {
      throw new Error('Not authenticated');
    }

    try {
      const { search, status, paymentStatus, sortBy, sortOrder } = parsedInput;

      const csvRows = await withRLS(async () => {
        const whereConditions = [];
        if (status !== 'all') {
          whereConditions.push(eq(orders.status, status));
        }
        if (paymentStatus !== 'all') {
          whereConditions.push(eq(orders.paymentStatus, paymentStatus));
        }
        if (search) {
          whereConditions.push(
            or(ilike(orders.orderNumber, `%${search}%`), ilike(orders.guestEmail, `%${search}%`)),
          );
        }

        const sortColumn = (orders as any)[sortBy] || orders.createdAt;
        const result = await db
          .select({
            id: orders.id,
            orderNumber: orders.orderNumber,
            status: orders.status,
            paymentStatus: orders.paymentStatus,
            total: orders.total,
            guestEmail: orders.guestEmail,
            createdAt: orders.createdAt,
            customerFirstName: users.firstName,
            customerLastName: users.lastName,
            customerEmail: users.email,
          })
          .from(orders)
          .leftJoin(users, eq(orders.userId, users.id))
          .where(and(...whereConditions))
          .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
          .limit(1000);

        return result;
      });

      const headers = [
        'order_number',
        'status',
        'payment_status',
        'total',
        'customer_email',
        'created_at',
        'customer_name',
      ];

      const csvContent = [
        headers.join(','),
        ...csvRows.map((row) =>
          [
            row.orderNumber,
            row.status,
            row.paymentStatus,
            row.total,
            row.customerEmail || row.guestEmail,
            row.createdAt.toISOString(),
            `${row.customerFirstName || ''} ${row.customerLastName || ''}`.trim(),
          ]
            .map((field) => `"${String(field).replace(/"/g, '""')}"`)
            .join(','),
        ),
      ].join('\n');

      logAdminAuditEvent({
        eventType: ADMIN_AUDIT_EVENTS.ORDER_CSV_EXPORTED,
        userId: ctx.user.id,
        metadata: { exportedCount: csvRows.length },
      });

      return {
        success: true,
        data: {
          csvContent,
          exportedCount: csvRows.length,
          truncated: csvRows.length >= 1000,
        },
      };
    } catch (error) {
      logger.error('Failed to export orders CSV', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export orders',
      };
    }
  });

export const getAdminOrderByIdAction = adminActionClient
  .schema(z.object({ orderId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.user?.id) {
      throw new Error('Not authenticated');
    }

    const { orderId } = parsedInput;

    const order = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        total: orders.total,
        guestEmail: orders.guestEmail,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        trackingNumber: orders.trackingNumber,
        trackingUrl: orders.trackingUrl,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order || order.length === 0) {
      throw new Error('Order not found');
    }

    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        subtotal: orderItems.subtotal,
        productName: products.name,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return {
      success: true,
      data: {
        ...order[0],
        items,
      },
    };
  });
