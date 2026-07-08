// Re-exports for backward compatibility — files moved to domain/

export { type CreateOrderProps, Order } from '../domain/entities/order.entity';
export type { OrderId } from '../domain/entities/order-id.vo';
export {
  type MoneySnapshot,
  moneySnapshot,
  OrderItem,
  type OrderItemId,
} from '../domain/entities/order-item.vo';
export { OrderStatus, OrderStatusHelper } from '../domain/entities/order-status.vo';
export { type CreatePaymentProps, Payment } from '../domain/entities/payment.entity';
export { PaymentId } from '../domain/entities/payment-id.vo';
export { PaymentMethod } from '../domain/entities/payment-method.vo';
export { PaymentStatus } from '../domain/entities/payment-status.vo';
