import { DomainEventBase } from '@pranakaia/shared-kernel';
import type { OrderStatus } from '../entities/order-status.vo';

/** Union type of all order domain events. */
export type OrderEvent = OrderCreated | OrderStatusChanged | OrderCompleted | OrderCancelled;

/**
 * Emitted when a new order is created.
 *
 * @example
 * ```ts
 * const event = new OrderCreated('order_1', 'cust_1', 59980);
 * ```
 */
export class OrderCreated extends DomainEventBase {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly total: number,
  ) {
    super('OrderCreated', orderId, 1, { customerId, total });
  }
}

/**
 * Emitted when an order's status transitions.
 *
 * @example
 * ```ts
 * const event = new OrderStatusChanged('order_1', 'PENDING', 'PROCESSING');
 * ```
 */
export class OrderStatusChanged extends DomainEventBase {
  constructor(
    public readonly orderId: string,
    public readonly from: OrderStatus,
    public readonly to: OrderStatus,
  ) {
    super('OrderStatusChanged', orderId, 1, { from, to });
  }
}

/** Emitted when an order is completed (delivered). */
export class OrderCompleted extends DomainEventBase {
  constructor(public readonly orderId: string) {
    super('OrderCompleted', orderId, 1);
  }
}

/**
 * Emitted when an order is cancelled.
 *
 * @example
 * ```ts
 * const event = new OrderCancelled('order_1', 'PENDING', 'customer_request');
 * ```
 */
export class OrderCancelled extends DomainEventBase {
  constructor(
    public readonly orderId: string,
    public readonly from: OrderStatus,
    public readonly reason: string,
  ) {
    super('OrderCancelled', orderId, 1, { from, reason });
  }
}
