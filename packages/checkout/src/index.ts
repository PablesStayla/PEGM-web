/**
 * @pranakaia/checkout — Checkout Bounded Context
 *
 * Order creation, payment orchestration, and checkout flow.
 *
 * Screaming Architecture: domain/ → application/ → infrastructure/
 */

export * from './application/checkout.builders';
export * from './application/checkout.helpers';
export * from './application/checkout.service';
// ── Application ───────────────────────────────────────────────────────────
export * from './application/checkout-payment.service';
export * from './application/checkout-validator.service';
export * from './application/orders/order.service';
export { type CreateOrderProps, Order } from './domain/entities/order.entity';
// ── Domain ────────────────────────────────────────────────────────────────
export type { OrderId } from './domain/entities/order-id.vo';
export {
  type MoneySnapshot,
  moneySnapshot,
  OrderItem,
  type OrderItemId,
} from './domain/entities/order-item.vo';
export { OrderStatus, OrderStatusHelper } from './domain/entities/order-status.vo';
export { type CreatePaymentProps, Payment } from './domain/entities/payment.entity';
export { PaymentId } from './domain/entities/payment-id.vo';
export { PaymentMethod } from './domain/entities/payment-method.vo';
export { PaymentStatus } from './domain/entities/payment-status.vo';
export * from './domain/events/order.events';
export * from './domain/events/payment.events';
export type {
  CreateOrderParams,
  OrderRepository,
  PersistedOrder,
} from './domain/ports/order-repository';
