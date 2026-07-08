/**
 * @pranakaia/inventory — Inventory Bounded Context
 *
 * Stock management, reservations, and adjustments.
 *
 * Screaming Architecture: domain/ → application/ → infrastructure/
 */

export * from './application/inventory.query.service';
// ── Application ───────────────────────────────────────────────────────────
export * from './application/inventory.service';
// ── Domain ────────────────────────────────────────────────────────────────
export { Inventory, InventoryId } from './domain/entities/inventory.entity';
export * from './domain/entities/inventory-base';
export * from './domain/entities/inventory-types';
export * from './domain/events/inventory.events';
export type { IInventoryRepository } from './domain/ports/inventory-repository';
