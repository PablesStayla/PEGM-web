import { DomainError, type OrderId, Result } from '@pranakaia/shared-kernel';
import type { IInventoryRepository } from '../domain/ports/inventory-repository';
import {
  bulkUpdateStockInDb,
  logStockAction,
  type ReserveStockItem,
  updateSingleStockInDb,
} from './inventory.helpers';
import type { InventoryStats, LowStockProduct } from './inventory.query.service';
import { InventoryQueryService } from './inventory.query.service';

export type { InventoryStats, LowStockProduct, ReserveStockItem };

/**
 * Inventory command service.
 *
 * Handles all write operations for stock: reservation, release,
 * consumption, and bulk updates. Read operations live in
 * {@link InventoryQueryService}.
 */
export class InventoryService {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  /**
   * Reserves stock for each item in the order atomically.
   * On partial failure, already-reserved items are released before returning an error.
   */
  async reserveStockForOrder(
    items: ReserveStockItem[],
    orderId?: OrderId,
  ): Promise<Result<ReserveStockItem[], Error>> {
    const reservedItems: ReserveStockItem[] = [];

    for (const item of items) {
      const result = await this.reserveItem(item, orderId);

      if (!result.success) {
        await this.releaseStockForOrder(reservedItems, orderId);
        return Result.err(result.errorValue as Error);
      }

      reservedItems.push(item);
    }

    return Result.ok(reservedItems);
  }

  private async reserveItem(
    item: ReserveStockItem,
    orderId?: OrderId,
  ): Promise<Result<void, Error>> {
    const res = await this.inventoryRepository.reserveStock(item.productId, item.quantity);

    if (!res.success) {
      return Result.err(res.errorValue as Error);
    }

    if (!res.value) {
      return Result.err(
        new DomainError(
          `No hay suficiente stock para el producto: ${item.name}`,
          'INSUFFICIENT_STOCK',
        ),
      );
    }

    await logStockAction('stock_reserved', item, orderId);
    return Result.ok(undefined);
  }

  /** Releases previously reserved stock, logging failures without aborting. */
  async releaseStockForOrder(
    items: ReserveStockItem[],
    orderId?: OrderId,
  ): Promise<Result<void, Error>> {
    for (const item of items) {
      const res = await this.releaseItem(item, orderId);
      if (!res.success) {
        await logStockAction(
          'stock_release_failed',
          item,
          orderId,
          { error: (res.errorValue as Error).message },
          'error',
        );
      }
    }
    return Result.ok(undefined);
  }

  private async releaseItem(
    item: ReserveStockItem,
    orderId?: OrderId,
  ): Promise<Result<void, Error>> {
    const res = await this.inventoryRepository.releaseStock(item.productId, item.quantity);

    if (!res.success) {
      return Result.err(res.errorValue as Error);
    }

    await logStockAction('stock_released', item, orderId, { reason: 'checkout_failed' }, 'warning');
    return Result.ok(undefined);
  }

  /** Permanently consumes reserved stock after successful order confirmation. */
  async confirmStockConsumption(
    items: ReserveStockItem[],
    orderId: OrderId,
  ): Promise<Result<void, Error>> {
    for (const item of items) {
      const res = await this.inventoryRepository.consumeStock(item.productId, item.quantity);
      if (!res.success) {
        return Result.err(res.errorValue as Error);
      }

      await logStockAction('stock_consumed', item, orderId);
    }
    return Result.ok(undefined);
  }

  /** Bulk-updates stock levels within a single database transaction. */
  async bulkUpdateStock(
    items: Array<{ productId: string; quantity: number }>,
    reason?: string,
  ): Promise<Result<void, Error>> {
    return bulkUpdateStockInDb(items, reason);
  }

  /** Updates the stock level for a single product. */
  async updateStock(
    productId: string,
    quantity: number,
    reason?: string,
  ): Promise<Result<{ id: string; stockQuantity: number }, Error>> {
    return updateSingleStockInDb(productId, quantity, reason);
  }

  /** Compatibility helper to get inventory statistics. */
  async getInventoryStats(): Promise<Result<InventoryStats, Error>> {
    return new InventoryQueryService().getStats();
  }

  /** Compatibility helper to get low stock products. */
  async getLowStockProducts(limit = 10): Promise<Result<LowStockProduct[], Error>> {
    return new InventoryQueryService().getLowStockProducts(limit);
  }
}
