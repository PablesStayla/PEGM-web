import type { ProductId } from '@pranakaia/catalog';

/** Branded type for Inventory identifiers. */
export type InventoryId = string & { readonly __brand: 'InventoryId' };

/**
 * Factory namespace for InventoryId creation.
 *
 * @example
 * ```ts
 * const id = InventoryId.generate(); // inv_1715566800000_abc123
 * const fromDb = InventoryId.from('inv_42');
 * ```
 */
export const InventoryId = {
  /** Generates a new unique InventoryId. */
  generate: (): InventoryId =>
    `inv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}` as InventoryId,
  /** Creates an InventoryId from a trusted string. */
  from: (value: string): InventoryId => value as InventoryId,
};

/**
 * Safety buffer calculation result for inventory.
 *
 * @example
 * ```ts
 * const buffer: StockSafetyBuffer = { absolute: 10, percentage: 25, calculated: 25 };
 * ```
 */
export interface StockSafetyBuffer {
  absolute: number;
  percentage: number;
  calculated: number;
}

/**
 * Properties required to create or rehydrate an Inventory aggregate.
 *
 * @example
 * ```ts
 * const props: InventoryProps = {
 *   id: InventoryId.generate(),
 *   productId: 'prod_1' as ProductId,
 *   sku: 'CAM-ECO-M',
 *   quantity: 100,
 *   reserved: 0,
 *   safetyStock: 10,
 *   location: 'MAIN_WAREHOUSE',
 * };
 * ```
 */
export interface InventoryProps {
  id: InventoryId;
  productId: ProductId;
  sku: string;
  quantity: number;
  reserved: number;
  safetyStock: number;
  location: string;
  lastSyncAt?: Date | null;
}
