import type {
  CreateOrderParams,
  OrderId,
  OrderRepository,
  PersistedOrder,
} from '@pranakaia/checkout';
import { Result } from '@pranakaia/shared-kernel';
import { eq } from 'drizzle-orm';
import { db, orderItems, orders } from '../db';

/**
 * Drizzle implementation of the Order Repository.
 * Handles database operations for the checkout bounding context.
 */
export class DrizzleOrderRepository implements OrderRepository {
  async create(
    params: CreateOrderParams,
  ): Promise<Result<{ id: OrderId; orderNumber: string }, Error>> {
    try {
      const orderId = crypto.randomUUID() as OrderId;
      const orderNumber = `PK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await db.transaction(async (tx) => {
        await this.insertOrderAndItems(tx, orderId, orderNumber, params);
      });

      return Result.ok({ id: orderId, orderNumber });
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  private async insertOrderAndItems(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    orderId: OrderId,
    orderNumber: string,
    params: CreateOrderParams,
  ): Promise<void> {
    const notes = this.getNotes(params);
    const userId = params.customerId ?? null;
    const guestEmail = params.guestEmail ?? null;

    // 1. Insert Main Order
    await tx.insert(orders).values({
      id: orderId,
      orderNumber,
      userId,
      guestEmail,
      currency: params.currency,
      subtotal: params.subtotal.amount.toString(),
      taxTotal: params.taxAmount.amount.toString(),
      shippingTotal: params.shippingAmount.amount.toString(),
      total: params.totalAmount.amount.toString(),
      status: 'PENDING',
      notes,
    } as typeof orders.$inferInsert);

    // 2. Insert Order Items
    if (params.items.length > 0) {
      await this.insertOrderItems(tx, orderId, params.items);
    }
  }

  private getNotes(params: CreateOrderParams): string | null {
    if ('notes' in params && typeof params.notes === 'string') {
      return params.notes;
    }
    return params.metadata ? JSON.stringify(params.metadata) : null;
  }

  private async insertOrderItems(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    orderId: OrderId,
    items: CreateOrderParams['items'],
  ): Promise<void> {
    await tx.insert(orderItems).values(
      items.map((item) => ({
        id: crypto.randomUUID(),
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price.amount.toString(),
        subtotal: (item.price.amount * item.quantity).toString(),
      })),
    );
  }

  async findById(id: OrderId, userId?: string): Promise<Result<PersistedOrder | null, Error>> {
    try {
      const row = await this.findOrderRow(id);
      if (!row) {
        return Result.ok(null);
      }

      if (!this.isUserAuthorized(row.userId, userId)) {
        return Result.ok(null);
      }

      const items = await this.findOrderItems(id);
      const persistedOrder = this.mapToPersistedOrder(row, items);
      return Result.ok(persistedOrder);
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  private isUserAuthorized(rowUserId: string | null, userId?: string): boolean {
    if (!userId) {
      return true;
    }
    return rowUserId === userId;
  }

  private async findOrderRow(id: OrderId) {
    const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return rows[0] || null;
  }

  private async findOrderItems(id: OrderId) {
    return db.select().from(orderItems).where(eq(orderItems.orderId, id));
  }

  private mapToPersistedOrder(
    row: typeof orders.$inferSelect,
    items: (typeof orderItems.$inferSelect)[],
  ): PersistedOrder {
    return {
      ...row,
      id: row.id as OrderId,
      items: items.map((item) => ({
        ...item,
        productId: item.productId || '',
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
    } as unknown as PersistedOrder;
  }

  async findByCustomer(customerId: string): Promise<Result<PersistedOrder[], Error>> {
    try {
      const rows = await db.select().from(orders).where(eq(orders.userId, customerId));

      const ordersWithItems = await Promise.all(
        rows.map(async (row) => {
          const items = await this.findOrderItems(row.id as OrderId);
          return this.mapToPersistedOrder(row, items);
        }),
      );

      return Result.ok(ordersWithItems);
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
  }): Promise<Result<PersistedOrder[], Error>> {
    try {
      let query = db.select().from(orders).$dynamic();

      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.offset(options.offset);
      }

      const rows = await query;
      const persistedOrders = rows.map(
        (r) => ({ ...r, id: r.id as OrderId }) as unknown as PersistedOrder,
      );
      return Result.ok(persistedOrders);
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async updateStatus(id: OrderId, status: string): Promise<Result<void, Error>> {
    try {
      await db
        .update(orders)
        .set({
          status: status as unknown as (typeof orders.$inferInsert)['status'],
          updatedAt: new Date(),
        })
        .where(eq(orders.id, id));
      return Result.ok(undefined);
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }
}
