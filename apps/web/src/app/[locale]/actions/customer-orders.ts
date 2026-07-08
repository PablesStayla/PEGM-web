'use server';

import { orderItems, orders, products, withRLS } from '@pranakaia/infrastructure/db';
import { desc, eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function getCustomerOrders() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Find orders by userId using RLS for isolation
    const userOrders = await withRLS(user.id, 'authenticated', async (tx) => {
      return tx
        .select()
        .from(orders)
        .where(eq(orders.userId, user.id))
        .orderBy(desc(orders.createdAt));
    });

    return { success: true, data: userOrders };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders',
    };
  }
}

export async function getOrderByNumber(orderNumber: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const result = await withRLS(user.id, 'authenticated', async (tx) => {
      const orderResult = await tx.select().from(orders).where(eq(orders.orderNumber, orderNumber));
      const order = orderResult[0];

      if (!order || (order.userId && order.userId !== user.id)) {
        return null; // RLS will also block this, but we return null for logic
      }

      const items = await tx
        .select({
          id: orderItems.id,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          subtotal: orderItems.subtotal,
          productName: products.name,
          productSku: products.sku,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    });

    if (!result) {
      return { success: false, error: 'Order not found' };
    }

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order',
    };
  }
}
