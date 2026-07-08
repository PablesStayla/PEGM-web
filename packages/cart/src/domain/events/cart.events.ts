import { DomainEventBase } from '@pranakaia/shared-kernel';

/**
 * Emitted when a new cart is created.
 *
 * @example
 * ```ts
 * cart.events.find(e => e instanceof CartCreated);
 * ```
 */
export class CartCreated extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly customerId: string | null,
    readonly sessionId: string | null,
  ) {
    super('CartCreated', aggregateId, 1);
  }
}

/**
 * Emitted when an item is added to the cart.
 *
 * @example
 * ```ts
 * // After cart.addItem(item):
 * const event = cart.events.find(e => e instanceof ItemAddedToCart);
 * ```
 */
export class ItemAddedToCart extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly productId: string,
    readonly quantity: number,
    readonly unitPrice: number,
  ) {
    super('ItemAddedToCart', aggregateId, 1);
  }
}

/**
 * Emitted when an item is removed from the cart.
 *
 * @example
 * ```ts
 * cart.removeItem(itemId);
 * // → ItemRemovedFromCart event emitted
 * ```
 */
export class ItemRemovedFromCart extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly productId: string,
    readonly quantity: number,
  ) {
    super('ItemRemovedFromCart', aggregateId, 1);
  }
}

/**
 * Emitted when an item's quantity is updated in the cart.
 *
 * @example
 * ```ts
 * cart.updateItemQuantity(itemId, 5);
 * // → ItemQuantityUpdated { oldQuantity: 2, newQuantity: 5 }
 * ```
 */
export class ItemQuantityUpdated extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly productId: string,
    readonly oldQuantity: number,
    readonly newQuantity: number,
  ) {
    super('ItemQuantityUpdated', aggregateId, 1);
  }
}

/**
 * Emitted when all items are cleared from the cart.
 *
 * @example
 * ```ts
 * cart.clear();
 * // → CartCleared { itemCount: 3 }
 * ```
 */
export class CartCleared extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly itemCount: number,
  ) {
    super('CartCleared', aggregateId, 1);
  }
}

/**
 * Emitted when the cart expires.
 *
 * @example
 * ```ts
 * cart.expire();
 * // → CartExpired event emitted
 * ```
 */
export class CartExpired extends DomainEventBase {
  constructor(aggregateId: string) {
    super('CartExpired', aggregateId, 1);
  }
}

/**
 * Emitted when a cart is successfully checked out and converted to an order.
 *
 * @example
 * ```ts
 * // After checkout completes:
 * const event = cart.events.find(e => e instanceof CartCheckedOut);
 * ```
 */
export class CartCheckedOut extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly orderId: string,
    readonly total: number,
  ) {
    super('CartCheckedOut', aggregateId, 1);
  }
}
