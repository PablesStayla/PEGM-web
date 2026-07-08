import type { ProductId } from '@pranakaia/catalog';
import type { Result } from '@pranakaia/shared-kernel';
import type { Inventory, InventoryId } from '../entities/inventory.entity';

/**
 * Repository port for Inventory persistence with atomic stock operations.
 *
 * @example
 * ```ts
 * class DrizzleInventoryRepository implements IInventoryRepository {
 *   async reserveStock(productId, qty) { ... } // ACID-guaranteed
 *   async findByProductId(productId) { ... }
 * }
 * ```
 */
export interface IInventoryRepository {
  /** Finds inventory by product ID. Returns `null` if not found. */
  findByProductId(productId: ProductId): Promise<Result<Inventory | null>>;
  /** Finds inventory by its internal ID. Returns `null` if not found. */
  findById(id: InventoryId): Promise<Result<Inventory | null>>;
  /** Persists inventory state (insert or update). */
  save(inventory: Inventory): Promise<Result<void>>;
  /**
   * Atomically reserves stock for a product.
   * Returns `false` if insufficient stock.
   * Implementation should ensure ACID properties.
   */
  reserveStock(productId: ProductId, quantity: number): Promise<Result<boolean>>;
  /**
   * Atomically releases previously reserved stock.
   * Used when a reservation is cancelled or expires.
   */
  releaseStock(productId: ProductId, quantity: number): Promise<Result<void>>;
  /**
   * Atomically consumes reserved stock.
   * Used when an order is confirmed/fulfilled.
   */
  consumeStock(productId: ProductId, quantity: number): Promise<Result<void>>;
}
