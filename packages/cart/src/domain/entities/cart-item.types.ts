import { DomainError } from '@pranakaia/shared-kernel';

/** Nominal ID for a single line item in a cart. */
export type CartItemId = string & { readonly __brand: 'CartItemId' };

/** Nominal SKU identifier for a product variant. */
export type Sku = string & { readonly __brand: 'Sku' };

/** Nominal product identifier within the cart bounded context. */
export type ProductId = string & { readonly __brand: 'ProductId' };

/** Factory helpers for {@link CartItemId}. */
export const CartItemIdHelper = {
  generate: (): CartItemId =>
    `item_${Date.now()}_${Math.random().toString(36).substring(2, 11)}` as CartItemId,
  from: (value: string): CartItemId => value as CartItemId,
};

/** Base error for all cart item domain failures. */
export class CartItemError extends DomainError {
  constructor(message: string, code: string, context?: Record<string, unknown>) {
    super(message, `CART_ITEM_${code}`, context);
    this.name = 'CartItemError';
  }
}

/** Thrown when cart item creation input fails structural validation. */
export class CartItemValidationError extends CartItemError {
  constructor(details: string, context?: Record<string, unknown>) {
    super(`Validation failed: ${details}`, 'VALIDATION_FAILED', context);
    this.name = 'CartItemValidationError';
  }
}
