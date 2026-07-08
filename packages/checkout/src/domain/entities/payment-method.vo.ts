/**
 * Supported payment methods.
 *
 * @example
 * ```ts
 * const method = PaymentMethod.FLOW;
 * // Processing Flow checkout...
 * ```
 */
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  FLOW = 'FLOW',
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
}
