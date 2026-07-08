/**
 * @pranakaia/shipping — Shipping Bounded Context
 *
 * Shipping rate calculation, zone management, and provider integration.
 *
 * Screaming Architecture: domain/ → application/ → infrastructure/
 */

// ── Application ───────────────────────────────────────────────────────────
export * from './application/shipping.service';
// ── Domain ────────────────────────────────────────────────────────────────
export type { CalculateRateInput, ShippingProvider } from './domain/ports/shipping-provider';
export type {
  ShippingRate,
  ShippingRepository,
  ShippingZone,
} from './domain/ports/shipping-repository';
