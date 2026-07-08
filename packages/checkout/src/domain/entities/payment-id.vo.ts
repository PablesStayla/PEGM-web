export type { OrderId } from '@pranakaia/shared-kernel';

/**
 * Branded type for Payment identifiers.
 *
 * @example
 * ```ts
 * const id = PaymentId.generate();
 * const fromDb = PaymentId.create('pay_123');
 * ```
 */
export type PaymentIdBrand = string & { readonly __brand: 'PaymentId' };

/**
 * Factory namespace for PaymentId creation and comparison.
 *
 * @example
 * ```ts
 * const id = PaymentId.generate();    // pay_1715566800000_abc123
 * const same = PaymentId.create('pay_123');
 * PaymentId.equals(id, same);         // false
 * ```
 */
export const PaymentId = {
  /** Generates a new unique PaymentId. */
  generate: (): PaymentIdBrand =>
    `pay_${Date.now()}_${Math.random().toString(36).substring(2, 11)}` as PaymentIdBrand,

  /** Creates a PaymentId from a known string value. */
  create: (value: string): PaymentIdBrand => value as PaymentIdBrand,

  /** Alias for `create()` — use when the value is from a trusted source. */
  from: (value: string): PaymentIdBrand => value as PaymentIdBrand,

  /** Strict equality check between two PaymentIds. */
  equals: (a: PaymentIdBrand, b: PaymentIdBrand): boolean => a === b,
};
