import type { DropshipOrderId, SupplierId } from '@pranakaia/shared-kernel';
import type { DropshipOrder, DropshipOrderProps, DropshipOrderStatus } from '../entities';

/**
 * Repository port for DropshipOrder persistence.
 *
 * @example
 * ```ts
 * class DrizzleDropshipOrderRepo implements IDropshipOrderRepository {
 *   async findById(id) { ... }
 *   async findPending() { ... }
 * }
 * ```
 */
export interface IDropshipOrderRepository {
  /** Finds a dropship order by its internal ID. */
  findById(id: DropshipOrderId | string): Promise<DropshipOrder | null>;
  /** Finds all dropship orders for a given parent order. */
  findByOrderId(orderId: string): Promise<DropshipOrder[]>;
  /** Finds dropship orders for a supplier, optionally filtered by status. */
  findBySupplier(
    supplierId: SupplierId | string,
    status?: DropshipOrderStatus,
  ): Promise<DropshipOrder[]>;
  /** Finds all pending (unsubmitted) dropship orders. */
  findPending(): Promise<DropshipOrder[]>;
  /** Persists a dropship order (insert or update). */
  save(order: DropshipOrder): Promise<void>;
  /** Updates the status (and optional props) of a dropship order. */
  updateStatus(
    id: DropshipOrderId | string,
    status: DropshipOrderStatus,
    data?: Partial<DropshipOrderProps>,
  ): Promise<void>;
}
