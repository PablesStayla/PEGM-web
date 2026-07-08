import type { DomainEvent } from '@pranakaia/shared-kernel';
import { DomainError, Result } from '@pranakaia/shared-kernel';
import {
  InventoryAdjusted,
  InventoryReleased,
  InventoryReserved,
  StockCounted,
} from '../events/inventory.events';
import { InventoryBase } from './inventory-base';
import type { InventoryProps } from './inventory-types';

export { InventoryId, type InventoryProps, type StockSafetyBuffer } from './inventory-types';

export class Inventory extends InventoryBase {
  rehydrate(_events: DomainEvent[]): void {
    // Implementar cuando se necesite reconstruir desde eventos
  }

  protected when(_event: DomainEvent): void {
    // Implementar cuando se necesite manejar eventos
  }
  static create(props: InventoryProps): Result<Inventory, DomainError> {
    if (props.quantity < 0) {
      return Result.err(new DomainError('Quantity cannot be negative', 'INVALID_QUANTITY'));
    }
    if (props.reserved < 0) {
      return Result.err(new DomainError('Reserved cannot be negative', 'INVALID_RESERVED'));
    }
    if (props.safetyStock < 0) {
      return Result.err(new DomainError('Safety stock cannot be negative', 'INVALID_SAFETY_STOCK'));
    }

    return Result.ok(new Inventory(props));
  }

  static reconstitute(props: InventoryProps): Inventory {
    return new Inventory(props);
  }

  addStock(quantity: number, reason?: string): Result<void, DomainError> {
    if (quantity <= 0) {
      return Result.err(new DomainError('Quantity must be positive', 'INVALID_QUANTITY'));
    }

    const prev = this._quantity;
    this._quantity += quantity;
    this.apply(
      new InventoryAdjusted(
        this.id,
        this._productId,
        prev,
        this._quantity,
        reason ?? 'manual_addition',
      ),
    );
    return Result.ok(undefined);
  }

  removeStock(quantity: number, reason?: string): Result<void, DomainError> {
    if (quantity <= 0) {
      return Result.err(new DomainError('Quantity must be positive', 'INVALID_QUANTITY'));
    }
    if (quantity > this.available) {
      return Result.err(new DomainError('Insufficient stock', 'INSUFFICIENT_STOCK'));
    }

    const prev = this._quantity;
    this._quantity -= quantity;
    this.apply(
      new InventoryAdjusted(
        this.id,
        this._productId,
        prev,
        this._quantity,
        reason ?? 'manual_removal',
      ),
    );
    return Result.ok(undefined);
  }

  reserveStock(quantity: number, orderId?: string): Result<void, DomainError> {
    if (quantity <= 0) {
      return Result.err(new DomainError('Quantity must be positive', 'INVALID_QUANTITY'));
    }
    if (quantity > this.available) {
      return Result.err(new DomainError('Insufficient stock', 'INSUFFICIENT_STOCK'));
    }

    this._reserved += quantity;
    this.apply(new InventoryReserved(this.id, this._productId, quantity, orderId));
    return Result.ok(undefined);
  }

  releaseReserved(quantity: number, reason?: string): Result<void, DomainError> {
    if (quantity <= 0) {
      return Result.err(new DomainError('Quantity must be positive', 'INVALID_QUANTITY'));
    }
    if (quantity > this._reserved) {
      return Result.err(new DomainError('Invalid release', 'INVALID_RELEASE'));
    }

    this._reserved -= quantity;
    this.apply(
      new InventoryReleased(this.id, this._productId, quantity, reason ?? 'order_cancelled'),
    );
    return Result.ok(undefined);
  }

  consumeStock(quantity: number, _orderId?: string): Result<void, DomainError> {
    if (quantity <= 0 || quantity > this._reserved) {
      return Result.err(new DomainError('Invalid consumption', 'INVALID_CONSUMPTION'));
    }

    this._quantity -= quantity;
    this._reserved -= quantity;
    this.apply(new StockCounted(this.id, this._productId, this._quantity));
    return Result.ok(undefined);
  }

  countStock(quantity: number): Result<void, DomainError> {
    if (quantity < 0) {
      return Result.err(new DomainError('Quantity cannot be negative', 'INVALID_QUANTITY'));
    }
    this._quantity = quantity;
    this._lastSyncAt = new Date();
    this.apply(new StockCounted(this.id, this._productId, this._quantity));
    return Result.ok(undefined);
  }

  updateSafetyStock(safetyStock: number): Result<void, DomainError> {
    if (safetyStock < 0) {
      return Result.err(new DomainError('Safety stock cannot be negative', 'INVALID_SAFETY_STOCK'));
    }
    this._safetyStock = safetyStock;
    return Result.ok(undefined);
  }
}
