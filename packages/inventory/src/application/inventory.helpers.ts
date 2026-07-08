import { db } from '@pranakaia/db';
import { productsTable } from '@pranakaia/db/schema';
import {
  AuditService,
  DomainError,
  type OrderId,
  type ProductId,
  Result,
} from '@pranakaia/shared-kernel';
import { eq } from 'drizzle-orm';

export interface ReserveStockItem {
  productId: ProductId;
  quantity: number;
  name: string;
}

/**
 * Logs a structured inventory action to the central Audit system.
 */
export async function logStockAction(
  action: string,
  item: ReserveStockItem & { productId?: string },
  orderId?: OrderId,
  extraMetadata: Record<string, unknown> = {},
  severity: 'info' | 'warning' | 'error' = 'info',
): Promise<void> {
  await AuditService.log({
    action,
    entityType: 'inventory',
    entityId: item.productId || '',
    severity,
    metadata: { quantity: item.quantity, orderId, ...extraMetadata },
  });
}

/**
 * Executes a bulk update of stock levels inside a single Drizzle transaction.
 */
export async function bulkUpdateStockInDb(
  items: Array<{ productId: string; quantity: number }>,
  reason?: string,
): Promise<Result<void, Error>> {
  try {
    await db.transaction(async (tx) => {
      for (const item of items) {
        const [updated] = await tx
          .update(productsTable)
          .set({ stockQuantity: item.quantity })
          .where(eq(productsTable.id, item.productId))
          .returning();

        await logStockAction(
          'stock_updated_bulk',
          {
            productId: item.productId as ProductId,
            quantity: item.quantity,
            name: updated?.name || '',
          },
          undefined,
          { reason },
        );
      }
    });

    return Result.ok(undefined);
  } catch (error) {
    return Result.err(error instanceof Error ? error : new Error('Failed to bulk update stock'));
  }
}

/**
 * Executes a single stock level update on the products table.
 */
export async function updateSingleStockInDb(
  productId: string,
  quantity: number,
  reason?: string,
): Promise<Result<{ id: string; stockQuantity: number }, Error>> {
  try {
    const [updatedProduct] = await db
      .update(productsTable)
      .set({ stockQuantity: quantity })
      .where(eq(productsTable.id, productId))
      .returning();

    if (!updatedProduct) {
      return Result.err(new DomainError('Producto no encontrado', 'PRODUCT_NOT_FOUND'));
    }

    await logStockAction(
      'stock_updated',
      { productId: productId as ProductId, quantity, name: updatedProduct.name },
      undefined,
      { reason },
    );

    return Result.ok({
      id: updatedProduct.id,
      stockQuantity: updatedProduct.stockQuantity ?? 0,
    });
  } catch (error) {
    return Result.err(error instanceof Error ? error : new Error('Failed to update stock'));
  }
}
