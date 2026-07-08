import { DomainEventBase } from '@pranakaia/shared-kernel';

/**
 * Emitted when stock is reserved for an order.
 *
 * @example
 * ```ts
 * const event = new InventoryReserved(inventoryId, productId, 5, orderId);
 * ```
 */
export class InventoryReserved extends DomainEventBase {
  constructor(
    aggregateId: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly orderId?: string,
  ) {
    super('inventory.reserved', aggregateId, 1, { productId, quantity, orderId });
  }
}

/**
 * Emitted when previously reserved stock is released.
 *
 * @example
 * ```ts
 * const event = new InventoryReleased(inventoryId, productId, 3, 'order_cancelled');
 * ```
 */
export class InventoryReleased extends DomainEventBase {
  constructor(
    aggregateId: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly reason?: string,
  ) {
    super('inventory.released', aggregateId, 1, { productId, quantity, reason });
  }
}

/**
 * Emitted when stock quantity is manually adjusted.
 *
 * @example
 * ```ts
 * const event = new InventoryAdjusted(inventoryId, productId, 100, 95, 'damaged');
 * ```
 */
export class InventoryAdjusted extends DomainEventBase {
  constructor(
    aggregateId: string,
    public readonly productId: string,
    public readonly previousQuantity: number,
    public readonly newQuantity: number,
    public readonly reason?: string,
  ) {
    super('inventory.adjusted', aggregateId, 1, {
      productId,
      previousQuantity,
      newQuantity,
      reason,
    });
  }
}

/**
 * Emitted after a physical stock count is performed.
 *
 * @example
 * ```ts
 * const event = new StockCounted(inventoryId, productId, 42);
 * ```
 */
export class StockCounted extends DomainEventBase {
  constructor(
    aggregateId: string,
    public readonly productId: string,
    public readonly quantity: number,
  ) {
    super('inventory.stock_counted', aggregateId, 1, { productId, quantity });
  }
}
