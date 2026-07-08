/**
 * Payment lifecycle statuses.
 *
 * @example
 * ```ts
 * if (payment.status === PaymentStatus.CAPTURED) {
 *   // Payment settled — proceed with fulfillment
 * }
 * ```
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  CANCELLED = 'CANCELLED',
}
