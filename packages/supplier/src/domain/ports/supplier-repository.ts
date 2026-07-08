import type { SupplierId } from '@pranakaia/shared-kernel';
import type { Supplier } from '../entities/supplier';

/**
 * Repository port for Supplier persistence.
 *
 * @example
 * ```ts
 * class DrizzleSupplierRepository implements ISupplierRepository {
 *   async findById(id) { ... }
 *   async findAll() { ... }
 * }
 * ```
 */
export interface ISupplierRepository {
  /** Finds a supplier by its ID. Returns `null` if not found. */
  findById(id: SupplierId | string): Promise<Supplier | null>;
  /** Returns all configured suppliers. */
  findAll(): Promise<Supplier[]>;
  /** Persists a supplier (insert or update). */
  save(supplier: Supplier): Promise<void>;
  /** Deletes a supplier by its ID. */
  delete(id: SupplierId | string): Promise<void>;
}
