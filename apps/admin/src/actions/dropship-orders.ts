'use server';

import { dropshipOrders, products, withRLS } from '@pranakaia/infrastructure/db';
import { AuthenticationError } from '@pranakaia/shared-kernel';
import { count, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { adminActionClient } from '@/lib/safe-action';
import { requireAdminPermission } from '@/lib/security/admin-rbac';

const getDropshipOrdersSchema = z
  .object({
    status: z.string().optional(),
  })
  .optional();

export const getDropshipOrdersAction = adminActionClient
  .schema(getDropshipOrdersSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    if (!user) {
      throw new AuthenticationError();
    }

    await requireAdminPermission({
      user,
      resource: 'dropship_orders',
      action: 'read',
    });

    const status = parsedInput?.status;

    try {
      const orders = await withRLS(user.id, 'authenticated', async (tx) => {
        const query = tx
          .select({
            id: dropshipOrders.id,
            orderId: dropshipOrders.orderId,
            supplierName: sql`'N/A'`,
            supplierSku: sql`'N/A'`,
            productName: products.name,
            quantity: dropshipOrders.quantity,
            unitCost: dropshipOrders.unitCost,
            totalCost: dropshipOrders.totalCost,
            status: dropshipOrders.status,
            trackingNumber: dropshipOrders.trackingNumber,
            carrier: dropshipOrders.carrier,
            createdAt: dropshipOrders.createdAt,
            submittedAt: dropshipOrders.submittedAt,
            shippedAt: dropshipOrders.shippedAt,
            deliveredAt: dropshipOrders.deliveredAt,
          })
          .from(dropshipOrders)
          .leftJoin(products, eq(dropshipOrders.productId, products.id));

        if (status && status !== 'ALL') {
          query.where(
            eq(
              dropshipOrders.status,
              status as 'PENDING' | 'SUBMITTED' | 'SHIPPED' | 'DELIVERED' | 'FAILED',
            ),
          );
        }

        return query.orderBy(desc(dropshipOrders.createdAt)).limit(100);
      });

      return {
        success: true,
        data: orders.map((o: any) => ({
          id: o.id,
          orderNumber: o.orderId,
          supplierName: o.supplierName || 'N/A',
          supplierSku: o.supplierSku || 'N/A',
          productName: o.productName || 'N/A',
          quantity: o.quantity,
          unitCost: Number(o.unitCost),
          totalCost: Number(o.totalCost),
          status: o.status,
          trackingNumber: o.trackingNumber,
          carrier: o.carrier,
          errors: [],
          retryCount: 0,
          createdAt: o.createdAt.toISOString(),
          submittedAt: o.submittedAt?.toISOString() ?? null,
          shippedAt: o.shippedAt?.toISOString() ?? null,
          deliveredAt: o.deliveredAt?.toISOString() ?? null,
        })),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        message.includes('relation') &&
        message.includes('dropship_orders') &&
        message.includes('does not exist')
      ) {
        return { success: true, data: [] };
      }

      logger.error('Error fetching dropship orders', { error: message });
      throw error;
    }
  });

export const getDropshipStatsAction = adminActionClient.action(async ({ ctx: { user } }) => {
  if (!user) {
    throw new AuthenticationError();
  }

  await requireAdminPermission({
    user,
    resource: 'dropship_orders',
    action: 'read',
  });

  try {
    const stats = await withRLS(user.id, 'authenticated', async (tx) => {
      return tx
        .select({
          status: dropshipOrders.status,
          value: count(),
        })
        .from(dropshipOrders)
        .groupBy(dropshipOrders.status);
    });

    const pending = stats.find((s: any) => s.status === 'PENDING')?.value || 0;
    const submitted = stats.find((s: any) => s.status === 'SUBMITTED')?.value || 0;
    const shipped = stats.find((s: any) => s.status === 'SHIPPED')?.value || 0;
    const failed = stats.find((s: any) => s.status === 'FAILED')?.value || 0;
    const total = stats.reduce((acc: number, s: any) => acc + s.value, 0);

    return {
      success: true,
      data: { pending, submitted, shipped, failed, total },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes('relation') &&
      message.includes('dropship_orders') &&
      message.includes('does not exist')
    ) {
      return { success: true, data: { pending: 0, submitted: 0, shipped: 0, failed: 0, total: 0 } };
    }

    logger.error('Error fetching dropship stats', { error: message });
    throw error;
  }
});
