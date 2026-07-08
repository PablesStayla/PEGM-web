import { type Currency, type CustomerId, Result, type SessionId } from '@pranakaia/shared-kernel';

// Re-export branded types for backward compatibility with cart consumers
export type { Currency, CustomerId, SessionId } from '@pranakaia/shared-kernel';

import {
  CartCleared,
  CartCreated,
  CartExpired,
  ItemAddedToCart,
  ItemQuantityUpdated,
  ItemRemovedFromCart,
} from '../events/cart.events';
import { CartError, CartValidationError } from './cart.errors';
import {
  buildCartValidationError,
  type CreateCartProps,
  CreateCartSchema,
  getCartExpiry,
} from './cart.schemas';
import { CartState } from './cart.state';
import type { CartId } from './cart-id.vo';
import type { CartItem, CartItemId } from './cart-item.vo';

export { CartError, CartValidationError } from './cart.errors';
export type { CreateCartProps } from './cart.schemas';

/**
 * Cart Aggregate Root — represents a shopping shopping cart in the e-commerce domain.
 *
 * Extends {@link CartState} for clean Separation of Concerns (SRP) to manage state and fields,
 * while implementing business behaviors and event emissions.
 */
export class Cart extends CartState {
  private constructor(
    id: CartId,
    customerId: CustomerId | null,
    sessionId: SessionId | null,
    currency: Currency,
    expiresAt: Date,
    createdAt: Date,
  ) {
    super(id, customerId, sessionId, currency, expiresAt, createdAt);
  }

  /** Factory method to create a new Cart. */
  static create(props: CreateCartProps): Result<Cart, CartError> {
    const validation = CreateCartSchema.safeParse(props);

    if (!validation.success) {
      return Result.err(buildCartValidationError(validation.error));
    }

    const { items = [], id } = props;
    const data = validation.data;
    const currency = data.currency as Currency;

    if (items.some((item) => item.unitPrice.currency !== currency)) {
      return Result.err(
        new CartValidationError('All items must use the cart currency', { currency }),
      );
    }

    const expiresAt = getCartExpiry(data.expiresAt);
    const customerId = (data.customerId as CustomerId) || null;
    const sessionId = (data.sessionId as SessionId) || null;

    const cart = new Cart(id, customerId, sessionId, currency, expiresAt, new Date());

    cart._items = [...items];
    cart._domainEvents.push(new CartCreated(cart.idValue, cart._customerId, cart._sessionId));

    return Result.ok(cart);
  }

  /** Adds an item to the cart or increases quantity if already present. */
  addItem(item: CartItem): Result<void, CartError> {
    if (this.isExpired()) {
      return Result.err(new CartError('Cart has expired', 'EXPIRED'));
    }

    if (item.unitPrice.currency !== this._currency) {
      return Result.err(new CartError('Item currency mismatch', 'CURRENCY_MISMATCH'));
    }

    const result = this.addOrUpdateCartItem(item);
    if (result.isFailure) {
      return Result.err(new CartError(result.errorValue.message, 'UPDATE_FAILED'));
    }

    this._domainEvents.push(
      new ItemAddedToCart(this.idValue, item.productId, item.quantity, item.unitPrice.amount),
    );

    return Result.ok(undefined);
  }

  private addOrUpdateCartItem(item: CartItem): Result<void, Error> {
    const existingIndex = this.findItemIndex(item.productId, item.sku);

    if (existingIndex >= 0) {
      return this.updateExistingItemQuantity(existingIndex, item.quantity);
    }

    this._items.push(item);
    return Result.ok(undefined);
  }

  private findItemIndex(productId: string, sku: string): number {
    return this._items.findIndex((i) => i.productId === productId && i.sku === sku);
  }

  private updateExistingItemQuantity(index: number, quantity: number): Result<void, Error> {
    const existingItem = this._items[index]!;
    const updateResult = existingItem.increaseQuantity(quantity);
    if (updateResult.isFailure) {
      return Result.err(updateResult.errorValue);
    }
    this._items[index] = updateResult.getValue();
    return Result.ok(undefined);
  }

  /** Removes an item from the cart. */
  removeItem(itemId: CartItemId): Result<void, CartError> {
    const item = this._items.find((i) => i.id === itemId);
    if (!item) {
      return Result.err(new CartError('Item not found in cart', 'ITEM_NOT_FOUND'));
    }

    this._items = this._items.filter((i) => i.id !== itemId);
    this._domainEvents.push(new ItemRemovedFromCart(this.idValue, item.productId, item.quantity));

    return Result.ok(undefined);
  }

  /** Updates the quantity of a specific item. */
  updateItemQuantity(itemId: CartItemId, quantity: number): Result<void, CartError> {
    const item = this._items.find((i) => i.id === itemId);
    if (!item) {
      return Result.err(new CartError('Item not found in cart', 'ITEM_NOT_FOUND'));
    }

    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    const updateResult = item.updateQuantity(quantity);
    if (updateResult.isFailure) {
      return Result.err(new CartError(updateResult.errorValue.message, 'UPDATE_FAILED'));
    }

    const oldQuantity = item.quantity;
    this._items = this._items.map((i) => (i.id === itemId ? updateResult.getValue() : i));

    this._domainEvents.push(
      new ItemQuantityUpdated(this.idValue, item.productId, oldQuantity, quantity),
    );

    return Result.ok(undefined);
  }

  /** Clears all items from the cart. */
  clear(): Result<void, CartError> {
    const count = this._items.length;
    this._items = [];

    if (count > 0) {
      this._domainEvents.push(new CartCleared(this.idValue, count));
    }

    return Result.ok(undefined);
  }

  /** Marks the cart as expired. */
  expire(): void {
    this._expiresAt = new Date();
    this._domainEvents.push(new CartExpired(this.idValue));
  }
}
