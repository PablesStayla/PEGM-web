import type { ProductId } from '@pranakaia/catalog';
import type { Money, Result } from '@pranakaia/shared-kernel';
import type { OrderId } from '../entities/order-id.vo';

/**
 * Parameters for creating a new order.
 *
 * @example
 * ```ts
 * const params: CreateOrderParams = {
 *   customerId: 'cust_1',
 *   items: [{ productId: 'prod_1' as ProductId, name: 'Camiseta', price: Money.zero('CLP'), quantity: 2 }],
 *   currency: 'CLP',
 *   subtotal: Money.zero('CLP'),
 *   taxAmount: Money.zero('CLP'),
 *   shippingAmount: Money.zero('CLP'),
 *   totalAmount: Money.zero('CLP'),
 * };
 * ```
 */
export interface CreateOrderParams {
  customerId?: string;
  guestEmail?: string;
  items: Array<{
    productId: ProductId;
    name: string;
    price: Money;
    quantity: number;
    image?: string;
  }>;
  currency: string;
  subtotal: Money;
  taxAmount: Money;
  shippingAmount: Money;
  totalAmount: Money;
  shippingAddress?: Record<string, unknown>;
  billingAddress?: Record<string, unknown>;
  shippingMethod?: string;
  shippingProviderId?: string;
  isDiscreteShipping?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Persisted order representation from the data store.
 *
 * @example
 * ```ts
 * const order: PersistedOrder = { id: orderId, ...row };
 * ```
 */
export interface PersistedOrder {
  id: OrderId;
  [key: string]: unknown;
}

/**
 * Repository port for Order persistence.
 *
 * @example
 * ```ts
 * class DrizzleOrderRepository implements OrderRepository {
 *   async create(params) { ... }
 *   async findByCustomer(customerId) { ... }
 * }
 * ```
 */
export interface OrderRepository {
  /** Creates a new order and returns its ID and order number. */
  create(order: CreateOrderParams): Promise<Result<{ id: OrderId; orderNumber: string }, Error>>;
  /** Finds an order by ID, optionally scoping to a user. */
  findById(id: OrderId, userId?: string): Promise<Result<PersistedOrder | null, Error>>;
  /** Finds all orders for a customer. */
  findByCustomer(customerId: string): Promise<Result<PersistedOrder[], Error>>;
  /** Finds all orders with pagination. */
  findAll(options?: { limit?: number; offset?: number }): Promise<Result<PersistedOrder[], Error>>;
  /** Updates the status of an order. */
  updateStatus(id: OrderId, status: string): Promise<Result<void, Error>>;
}
