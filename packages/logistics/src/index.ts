/**
 * @pranakaia/logistics — Logistics Bounded Context
 *
 * Tracking, dispatch, ETAs and carrier integrations (Starken, BlueExpress).
 * Pure domain — NO SDK imports. Carrier adapters live in @pranakaia/infrastructure/carriers.
 *
 * Screaming Architecture: domain/ → application/ → infrastructure/
 */

export * from './application/fulfillment.registry';
// ── Application ───────────────────────────────────────────────────────────
export * from './application/fulfillment.service';
export * from './application/fulfillment.types';
export type {
  PackageDelivered,
  PackageDeliveryFailed,
  PackageDispatched,
} from './domain/events/logistics.events';
export type { ICarrierProvider } from './domain/ports/carrier-provider.port';
// ── Domain ────────────────────────────────────────────────────────────────
export * from './domain/value-objects/tracking.vo';
