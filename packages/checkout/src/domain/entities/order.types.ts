/**
 * Order Domain Types — Checkout Bounded Context
 *
 * Shared value shapes used by the Order aggregate and its consumers.
 */

import type { OrderId } from './order-id.vo';
import type { MoneySnapshot, OrderItem } from './order-item.vo';

/**
 * Ship-to or bill-to address for an order.
 *
 * @example
 * ```ts
 * const addr: Address = {
 *   street: 'Calle Falsa 123',
 *   city: 'Santiago',
 *   state: 'RM',
 *   zipCode: '8320000',
 *   country: 'CL',
 * };
 * ```
 */
export interface Address {
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly zipCode: string;
  readonly country: string;
}

/**
 * Properties required to create a new `Order` aggregate.
 *
 * @example
 * ```ts
 * const props: CreateOrderProps = {
 *   id: orderId,
 *   customerId: 'cust_001',
 *   cartId: 'cart_001',
 *   items: [item1, item2],
 *   shippingAddress: shippingAddr,
 *   currency: 'USD',
 *   subtotal: moneySnapshot(8000, 'USD'),
 *   shippingCost: moneySnapshot(0, 'USD'),
 *   tax: moneySnapshot(1520, 'USD'),
 * };
 * ```
 */
export interface CreateOrderProps {
  readonly id: OrderId;
  readonly customerId: string;
  readonly cartId: string;
  readonly items: OrderItem[];
  readonly shippingAddress: Address;
  readonly billingAddress?: Address;
  readonly currency: string;
  readonly subtotal: MoneySnapshot;
  readonly shippingCost: MoneySnapshot;
  readonly tax: MoneySnapshot;
  readonly discount?: MoneySnapshot;
  readonly createdAt?: Date;
}
