import type { DomainEvent } from '@pranakaia/shared-kernel';
import { Entity } from '@pranakaia/shared-kernel';
import type { Address } from './order.types';
import type { OrderId } from './order-id.vo';
import type { MoneySnapshot, OrderItem } from './order-item.vo';
import { addMoney, moneySnapshot } from './order-item.vo';
import type { OrderStatus } from './order-status.vo';

/**
 * OrderState — Encapsulates the state schema, constructor, and property getters of the Order Aggregate.
 *
 * This keeps data structures separated from behavioral operations in Order, supporting strict SRP
 * and complying with L12 physical file boundaries.
 */
export class OrderState extends Entity<OrderId> {
  protected _items: OrderItem[];
  protected _domainEvents: DomainEvent[] = [];
  protected _customerId: string;
  protected _cartId: string;
  protected _shippingAddress: Address;
  protected _billingAddress: Address;
  protected _currency: string;
  protected _subtotal: MoneySnapshot;
  protected _shippingCost: MoneySnapshot;
  protected _tax: MoneySnapshot;
  protected _discount: MoneySnapshot;
  protected _status: OrderStatus;

  protected constructor(
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
    super(id, createdAt, createdAt);
    this._items = [...items];
    this._customerId = customerId;
    this._cartId = cartId;
    this._shippingAddress = shippingAddress;
    this._billingAddress = billingAddress;
    this._currency = currency;
    this._subtotal = subtotal;
    this._shippingCost = shippingCost;
    this._tax = tax;
    this._discount = discount;
    this._status = status;
  }

  /**
   * Computes the grand total: `max(0, subtotal − discount) + shipping + tax`.
   */
  get total(): MoneySnapshot {
    const afterDiscount = moneySnapshot(
      Math.max(0, this._subtotal.amount - this._discount.amount),
      this._currency,
    );
    const shippingResult = addMoney(afterDiscount, this._shippingCost);
    if (shippingResult.isFailure) {
      return shippingResult as unknown as MoneySnapshot;
    }
    const taxResult = addMoney(shippingResult.getValue(), this._tax);
    if (taxResult.isFailure) {
      return taxResult as unknown as MoneySnapshot;
    }
    return taxResult.getValue();
  }

  get customerId(): string {
    return this._customerId;
  }

  get cartId(): string {
    return this._cartId;
  }

  get items(): readonly OrderItem[] {
    return this._items;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get currency(): string {
    return this._currency;
  }

  get subtotal(): MoneySnapshot {
    return this._subtotal;
  }

  get shippingCost(): MoneySnapshot {
    return this._shippingCost;
  }

  get tax(): MoneySnapshot {
    return this._tax;
  }

  get discount(): MoneySnapshot {
    return this._discount;
  }

  get events(): readonly DomainEvent[] {
    return this._domainEvents;
  }

  /** Clears accumulated domain events (e.g., after persistence). */
  clearEvents(): void {
    this._domainEvents = [];
  }

  override get idValue(): string {
    return this.id as string;
  }

  /** Converts the Order to a plain object for serialization. */
  toPrimitives() {
    return {
      id: this.idValue,
      customerId: this._customerId,
      cartId: this._cartId,
      items: this._items.map((item) => item.toPrimitives()),
      shippingAddress: this._shippingAddress,
      billingAddress: this._billingAddress,
      status: this._status,
      currency: this._currency,
      subtotal: this._subtotal,
      shippingCost: this._shippingCost,
      tax: this._tax,
      discount: this._discount,
      total: this.total,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
