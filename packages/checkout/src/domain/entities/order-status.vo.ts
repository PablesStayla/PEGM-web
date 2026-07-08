/**
 * Order status constants and helpers for the Checkout bounded context.
 *
 * Defines the finite state machine for order lifecycle transitions,
 * including validation rules for cancellation, finality, and payment.
 *
 * @example
 * ```ts
 * if (OrderStatusHelper.canTransitionTo(OrderStatus.PENDING, OrderStatus.CONFIRMED)) {
 *   order.transitionTo(OrderStatus.CONFIRMED);
 * }
 * ```
 *
 * @example
 * ```ts
 * // Check a valid transition
 * const allowed = OrderStatusHelper.canTransitionTo(OrderStatus.PENDING, OrderStatus.CONFIRMED);
 * // allowed === true
 * ```
 *
 * @example
 * ```ts
 * // Verify an order can be cancelled
 * const cancellable = OrderStatusHelper.canCancel(OrderStatus.PROCESSING);
 * // cancellable === true
 * ```
 */
/**
 * Order status enum-like constant object.
 *
 * @example
 * ```ts
 * const status = OrderStatus.PENDING; // 'PENDING'
 * ```
 */
export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

/**
 * Union type derived from the `OrderStatus` const dictionary.
 *
 * @example
 * ```ts
 * let status: OrderStatus = OrderStatus.SHIPPED;
 * // status can only be one of the 8 defined statuses
 * ```
 */
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

const CANCELLABLE_STATUSES: readonly OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
] as const;

const PAID_STATUSES: readonly OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
] as const;

/**
 * Helper object providing status-transition and lifecycle checks for orders.
 *
 * @example
 * ```ts
 * // Validate a transition
 * const ok = OrderStatusHelper.canTransitionTo(OrderStatus.CONFIRMED, OrderStatus.SHIPPED);
 *
 * // Check if a status is terminal
 * const done = OrderStatusHelper.isFinal(OrderStatus.COMPLETED);
 * ```
 */
/**
 * Helper functions for order status transitions and queries.
 *
 * @example
 * ```ts
 * OrderStatusHelper.canCancel(OrderStatus.PENDING);  // true
 * OrderStatusHelper.isFinal(OrderStatus.COMPLETED);  // true
 * OrderStatusHelper.isPaid(OrderStatus.CONFIRMED);   // true
 * ```
 */
export const OrderStatusHelper = {
  /**
   * Returns `true` if moving from `from` to `to` is a valid state transition.
   *
   * @example
   * ```ts
   * OrderStatusHelper.canTransitionTo(OrderStatus.PENDING, OrderStatus.CANCELLED);
   * // true
   * ```
   */
  canTransitionTo: (from: OrderStatus, to: OrderStatus): boolean => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.REFUNDED],
      [OrderStatus.COMPLETED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    return transitions[from]?.includes(to) ?? false;
  },

  /**
   * Returns `true` if the order has a cancellable status.
   *
   * @example
   * ```ts
   * OrderStatusHelper.canCancel(OrderStatus.PENDING); // true
   * OrderStatusHelper.canCancel(OrderStatus.DELIVERED); // false
   * ```
   */
  canCancel: (status: OrderStatus): boolean => {
    return (CANCELLABLE_STATUSES as readonly string[]).includes(status);
  },

  /**
   * Returns `true` if the status represents a terminal (no further transitions) state.
   *
   * @example
   * ```ts
   * OrderStatusHelper.isFinal(OrderStatus.CANCELLED); // true
   * OrderStatusHelper.isFinal(OrderStatus.SHIPPED); // false
   * ```
   */
  isFinal: (status: OrderStatus): boolean => {
    return (
      status === OrderStatus.COMPLETED ||
      status === OrderStatus.CANCELLED ||
      status === OrderStatus.REFUNDED
    );
  },

  /**
   * Returns `true` if the status reflects a payment that has been processed.
   *
   * @example
   * ```ts
   * OrderStatusHelper.isPaid(OrderStatus.CONFIRMED); // true
   * OrderStatusHelper.isPaid(OrderStatus.PENDING); // false
   * ```
   */
  isPaid: (status: OrderStatus): boolean => {
    return (PAID_STATUSES as readonly string[]).includes(status);
  },
};

/**
 * Public API re-export that mirrors `OrderStatusHelper` under a stable namespace.
 *
 * @example
 * ```ts
 * OrderStatusApi.canCancel(OrderStatus.PENDING); // true
 * ```
 */
/**
 * Public API facade for order status queries (read-only subset of OrderStatusHelper).
 *
 * @example
 * ```ts
 * OrderStatusApi.isPaid(order.status);
 * ```
 */
export const OrderStatusApi = {
  canTransitionTo: OrderStatusHelper.canTransitionTo,
  canCancel: OrderStatusHelper.canCancel,
  isFinal: OrderStatusHelper.isFinal,
  isPaid: OrderStatusHelper.isPaid,
} as const;
