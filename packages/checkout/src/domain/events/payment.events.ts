import { DomainEventBase } from '@pranakaia/shared-kernel';

/** Union type of all payment domain events. */
export type PaymentEvent =
  | PaymentCreated
  | PaymentAuthorized
  | PaymentCaptured
  | PaymentFailed
  | PaymentRefunded;

/**
 * Emitted when a new payment is created for an order.
 *
 * @example
 * ```ts
 * const event = new PaymentCreated('pay_1', 'order_1', 29990);
 * ```
 */
export class PaymentCreated extends DomainEventBase {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly amount: number,
  ) {
    super('PaymentCreated', paymentId, 1, { orderId, amount });
  }
}

/**
 * Emitted when a payment is authorized by the gateway.
 *
 * @example
 * ```ts
 * const event = new PaymentAuthorized('pay_1', 'order_1', 'cs_ext_123');
 * ```
 */
export class PaymentAuthorized extends DomainEventBase {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly externalId: string,
  ) {
    super('PaymentAuthorized', paymentId, 1, { orderId, externalId });
  }
}

/**
 * Emitted when an authorized payment is captured (settled).
 *
 * @example
 * ```ts
 * const event = new PaymentCaptured('pay_1', 'order_1', 29990);
 * ```
 */
export class PaymentCaptured extends DomainEventBase {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly amount: number,
  ) {
    super('PaymentCaptured', paymentId, 1, { orderId, amount });
  }
}

/**
 * Emitted when a payment fails.
 *
 * @example
 * ```ts
 * const event = new PaymentFailed('pay_1', 'order_1', 'card_declined');
 * ```
 */
export class PaymentFailed extends DomainEventBase {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly reason: string,
  ) {
    super('PaymentFailed', paymentId, 1, { orderId, reason });
  }
}

/**
 * Emitted when a payment is refunded.
 *
 * @example
 * ```ts
 * const event = new PaymentRefunded('pay_1', 29990);
 * ```
 */
export class PaymentRefunded extends DomainEventBase {
  constructor(
    public readonly paymentId: string,
    public readonly amount: number,
  ) {
    super('PaymentRefunded', paymentId, 1, { amount });
  }
}
