/**
 * Order Entity — Checkout Bounded Context
 *
 * Represents a customer order placed through the system. The Order is the
 * central aggregate in checkout, managing lifecycle transitions through a
 * finite state machine, accumulating domain events, and taking a snapshot
 * of pricing (MoneySnapshot) at creation time to decouple from catalog changes.
 *
 * Rules:
 * - Financials are frozen at creation — catalog price changes do not affect
 *   historical orders.
 * - An order must have at least one item.
 * - Total is computed from subtotal + shipping + tax − discount, all using
 *   snapshot arithmetic.
 */
import { Result } from '@pranakaia/shared-kernel';
import {
  OrderCancelled,
  OrderCompleted,
  OrderCreated,
  OrderStatusChanged,
} from '../events/order.events';
import { OrderState } from './order.state';
import type { Address, CreateOrderProps } from './order.types';
import type { OrderId } from './order-id.vo';
import type { MoneySnapshot, OrderItem } from './order-item.vo';
import { moneySnapshot } from './order-item.vo';
import { OrderStatus, OrderStatusHelper } from './order-status.vo';

export type { Address, CreateOrderProps } from './order.types';

/**
 * Root aggregate for the checkout context.
 *
 * Manages order items, status transitions, domain events, and financial
 * snapshot math. Created in `PENDING` status and progressed through the
 * state machine lifecycle.
 *
 * @example
 * ```ts
 * const orderResult = Order.create({
 *   id: orderId,
 *   customerId: 'cust_abc123',
 *   cartId: 'cart_xyz456',
 *   items: [orderItem],
 *   shippingAddress: { street: 'Av. Siempre Viva 742', city: 'Springfield', state: 'IL', zipCode: '62701', country: 'US' },
 *   currency: 'USD',
 *   subtotal: moneySnapshot(5000, 'USD'),
 *   shippingCost: moneySnapshot(500, 'USD'),
 *   tax: moneySnapshot(950, 'USD'),
 * });
 * ```
 */
export class Order extends OrderState {
  private constructor(
    id: OrderId,
    customerId: string,
    cartId: string,
    items: OrderItem[],
    shippingAddress: Address,
    billingAddress: Address,
    currency: string,
    subtotal: MoneySnapshot,
    shippingCost: MoneySnapshot,
    tax: MoneySnapshot,
    discount: MoneySnapshot,
    status: OrderStatus,
    createdAt: Date,
  ) {
    super(
      id,
      customerId,
      cartId,
      items,
      shippingAddress,
      billingAddress,
      currency,
      subtotal,
      shippingCost,
      tax,
      discount,
      status,
      createdAt,
    );
  }

  /**
   * Factory method. Validates at least one item exists.
   *
   * @example
   * ```ts
   * const result = Order.create({ id, customerId, cartId, items: [item], shippingAddress, currency: 'USD', subtotal, shippingCost, tax });
   * // result.isSuccess === true
   * ```
   */
  static create(props: CreateOrderProps): Result<Order, Error> {
    if (props.items.length === 0) {
      return Result.err(new Error('Order must have at least one item'));
    }

    const zero = moneySnapshot(0, props.currency);

    const order = new Order(
      props.id,
      props.customerId,
      props.cartId,
      props.items,
      props.shippingAddress,
      props.billingAddress ?? props.shippingAddress,
      props.currency,
      props.subtotal,
      props.shippingCost,
      props.tax,
      props.discount ?? zero,
      OrderStatus.PENDING,
      props.createdAt ?? new Date(),
    );

    order._domainEvents.push(
      new OrderCreated(order.idValue, order._customerId, order.total.amount),
    );

    return Result.ok(order);
  }

  /**
   * Transitions the order to `newStatus` if the state machine allows it.
   * Fires `OrderStatusChanged` (and `OrderCompleted` if applicable).
   */
  changeStatus(newStatus: OrderStatus): Result<void, Error> {
    if (!OrderStatusHelper.canTransitionTo(this._status, newStatus)) {
      return Result.err(new Error(`Cannot transition from ${this._status} to ${newStatus}`));
    }

    const oldStatus = this._status;
    this._status = newStatus;

    this._domainEvents.push(new OrderStatusChanged(this.idValue, oldStatus, newStatus));

    if (newStatus === OrderStatus.COMPLETED) {
      this._domainEvents.push(new OrderCompleted(this.idValue));
    }

    return Result.ok(undefined);
  }

  /**
   * Cancels the order. Only allowed for cancellable statuses (PENDING, CONFIRMED, PROCESSING).
   * Fires `OrderCancelled` with the reason.
   */
  cancel(reason?: string): Result<void, Error> {
    if (!OrderStatusHelper.canCancel(this._status)) {
      return Result.err(new Error('Cannot cancel order in current status'));
    }

    const oldStatus = this._status;
    this._status = OrderStatus.CANCELLED;

    this._domainEvents.push(
      new OrderCancelled(this.idValue, oldStatus, reason ?? 'No reason provided'),
    );

    return Result.ok(undefined);
  }
}
