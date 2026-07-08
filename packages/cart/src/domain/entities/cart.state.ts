import {
  type Currency,
  type CurrencyCode,
  type CustomerId,
  type DomainEvent,
  Entity,
  Money,
  type SessionId,
} from '@pranakaia/shared-kernel';
import type { CartId } from './cart-id.vo';
import type { CartItem } from './cart-item.vo';

export class CartState extends Entity<CartId> {
  protected _items: CartItem[] = [];
  protected _domainEvents: DomainEvent[] = [];
  protected _expiresAt: Date;
  protected _customerId: CustomerId | null;
  protected _sessionId: SessionId | null;
  protected _currency: Currency;

  protected constructor(
    id: CartId,
    customerId: CustomerId | null,
    sessionId: SessionId | null,
    currency: Currency,
    expiresAt: Date,
    createdAt: Date,
  ) {
    super(id, createdAt, createdAt);
    this._customerId = customerId;
    this._sessionId = sessionId;
    this._currency = currency;
    this._expiresAt = expiresAt;
  }

  isExpired(): boolean {
    return Date.now() >= this._expiresAt.getTime();
  }

  get subtotal(): Money {
    const zero = Money.zero(this._currency as unknown as CurrencyCode);
    return this._items.reduce((sum, item) => {
      const result = sum.add(item.subtotal);
      return result.isSuccess ? result.getValue() : sum;
    }, zero);
  }

  get itemCount(): number {
    return this._items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get uniqueItemCount(): number {
    return this._items.length;
  }

  isEmpty(): boolean {
    return this._items.length === 0;
  }

  get customerId(): CustomerId | null {
    return this._customerId;
  }

  get sessionId(): SessionId | null {
    return this._sessionId;
  }

  get currency(): Currency {
    return this._currency;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get items(): readonly CartItem[] {
    return [...this._items];
  }

  get events(): readonly DomainEvent[] {
    return [...this._domainEvents];
  }

  clearEvents(): void {
    this._domainEvents = [];
  }

  toPrimitives() {
    return {
      id: this.idValue,
      customerId: this._customerId,
      sessionId: this._sessionId,
      currency: this._currency,
      items: this._items.map((item) => item.toPrimitives()),
      subtotal: this.subtotal.toPrimitives(),
      itemCount: this.itemCount,
      uniqueItemCount: this.uniqueItemCount,
      isEmpty: this.isEmpty(),
      expiresAt: this._expiresAt.toISOString(),
      createdAt: this.createdAt.toISOString(),
    };
  }
}
