'use server';

/**
 * Orders Resource Actions — Thin Wrappers
 */

import { z } from 'zod';
import { actionClient } from '@/providers/action-provider';
import { container } from '@/providers/container';
import { unwrapAsync } from '@/providers/data/result-bridge';
import {
  adminOrderFiltersSchema,
  cancelOrderSchema,
  exportOrdersSchema,
  refundOrderSchema,
  updateOrderStatusSchema,
} from './schemas';

const getOrderByIdSchema = z.object({ id: z.string() });

export const getAdminOrdersAction = actionClient
  .metadata({
    actionName: 'orders.list',
    ability: { action: 'read', subject: 'Order' },
  })
  .schema(adminOrderFiltersSchema)
  .action(async ({ parsedInput }) => {
    return await unwrapAsync(container.orderService.getAdminOrders(parsedInput));
  });

export const getOrderByIdAction = actionClient
  .metadata({
    actionName: 'orders.getDetail',
    ability: { action: 'read', subject: 'Order' },
  })
  .schema(getOrderByIdSchema)
  .action(async ({ parsedInput }) => {
    return await unwrapAsync(container.orderService.getOrderById(parsedInput.id));
  });

export const updateOrderStatusAction = actionClient
  .metadata({
    actionName: 'orders.updateStatus',
    ability: { action: 'update', subject: 'Order' },
  })
  .schema(updateOrderStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    return await unwrapAsync(
      container.orderService.updateOrderStatus({
        ...parsedInput,
        adminId: ctx.sessionUser.id,
      }),
    );
  });

// In index.ts, for export we use the exportOrdersSchema

export const exportOrdersCsvAction = actionClient
  .metadata({
    actionName: 'orders.exportCsv',
    ability: { action: 'export', subject: 'Order' },
  })
  .schema(exportOrdersSchema)
  .action(async ({ parsedInput, ctx }) => {
    return await unwrapAsync(
      container.orderService.exportOrdersCsv(parsedInput, ctx.sessionUser.id),
    );
  });

export const cancelOrderAction = actionClient
  .metadata({
    actionName: 'orders.cancel',
    ability: { action: 'update', subject: 'Order' },
  })
  .schema(cancelOrderSchema)
  .action(async ({ parsedInput, ctx }) => {
    return await unwrapAsync(
      container.orderService.cancelOrder(
        parsedInput.orderId,
        ctx.sessionUser.id,
        parsedInput.reason,
      ),
    );
  });

export const refundOrderAction = actionClient
  .metadata({
    actionName: 'orders.refund',
    ability: { action: 'refund', subject: 'Order' },
  })
  .schema(refundOrderSchema)
  .action(async ({ parsedInput, ctx }) => {
    return await unwrapAsync(
      container.orderService.refundOrder(
        parsedInput.orderId,
        ctx.sessionUser.id,
        parsedInput.amount,
      ),
    );
  });
