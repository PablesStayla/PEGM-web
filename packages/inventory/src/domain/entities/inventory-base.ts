import type { ProductId } from '@pranakaia/catalog';
import { AggregateRoot } from '@pranakaia/shared-kernel';
import type { InventoryId, InventoryProps, StockSafetyBuffer } from './inventory-types';

/**
 * Abstract base class for Inventory aggregates.
 *
 * Provides shared getters (productId, sku, quantity, reserved, available)
 * and safety buffer calculation. Concrete subclasses add domain methods
 * for stock operations (reserve, release, consume, adjust).
 *
 * @example
 * ```ts
 * class Inventory extends InventoryBase {
 *   static create(props: InventoryProps): Result<Inventory, Error> { ... }
 *   reserveStock(qty: number, orderId?: string): Result<void, Error> { ... }
 * }
 * ```
 */
export abstract class InventoryBase extends AggregateRoot<InventoryId> {
  protected _productId: ProductId;
  protected _sku: string;
  protected _quantity: number;
  protected _reserved: number;
  protected _safetyStock: number;
  protected _location: string;
  protected _lastSyncAt: Date | null;

  constructor(props: InventoryProps) {
    super(props.id);
    this._productId = props.productId;
    this._sku = props.sku;
    this._quantity = props.quantity;
    this._reserved = props.reserved;
    this._safetyStock = props.safetyStock;
    this._location = props.location;
    this._lastSyncAt = props.lastSyncAt ?? null;
  }

  get productId(): ProductId {
    return this._productId;
  }
  get sku(): string {
    return this._sku;
  }
  get quantity(): number {
    return this._quantity;
  }
  get reserved(): number {
    return this._reserved;
  }
  get safetyStock(): number {
    return this._safetyStock;
  }
  get location(): string {
    return this._location;
  }
  get lastSyncAt(): Date | null {
    return this._lastSyncAt;
  }

  /** Available stock = quantity − reserved − safetyStock (never negative). */
  get available(): number {
    return Math.max(0, this._quantity - this._reserved - this._safetyStock);
  }

  /**
   * Calculates the safety buffer metrics.
   *
   * @example
   * ```ts
   * const buffer = inventory.getSafetyBuffer();
   * console.log(buffer.percentage); // 10.0
   * ```
   */
  getSafetyBuffer(): StockSafetyBuffer {
    const percentage = this._quantity > 0 ? (this._safetyStock / this._quantity) * 100 : 0;
    return {
      absolute: this._safetyStock,
      percentage: Math.round(percentage * 100) / 100,
      calculated: this._quantity - this._reserved - this._safetyStock,
    };
  }

  /** Serializes inventory state to a plain object. */
  toPrimitives() {
    return {
      id: this.id,
      productId: this._productId,
      sku: this._sku,
      quantity: this._quantity,
      reserved: this._reserved,
      safetyStock: this._safetyStock,
      location: this._location,
      available: this.available,
      lastSyncAt: this._lastSyncAt?.toISOString() ?? null,
    };
  }
}
