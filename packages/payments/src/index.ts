/**
 * @pranakaia/payments — Payments Bounded Context
 *
 * Payment gateway port and gateway integration contract.
 *
 * Screaming Architecture: domain/ → application/ → infrastructure/
 */

// ── Domain ────────────────────────────────────────────────────────────────
export type { PaymentGateway } from './domain/ports/payment-gateway';
