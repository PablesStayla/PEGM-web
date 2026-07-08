import type { Supplier } from '../entities/supplier';
import type { ExternalInventory } from '../value-objects/external-inventory';

/**
 * Port for fetching inventory from external supplier sources (APIs, feeds).
 *
 * @example
 * ```ts
 * class AliExpressInventorySource implements IInventorySource {
 *   async fetchStock(supplier: Supplier): Promise<ExternalInventory[]> { ... }
 * }
 * ```
 */
export interface IInventorySource {
  /**
   * Fetches current stock levels from the supplier's external system.
   *
   * @param supplier - The supplier entity with API credentials.
   * @returns Array of external inventory entries.
   */
  fetchStock(supplier: Supplier): Promise<ExternalInventory[]>;
}
