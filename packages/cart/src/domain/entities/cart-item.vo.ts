import { Money, Result, ValueObject } from '@pranakaia/shared-kernel';
import { z } from 'zod';
import {
  CartItemError,
  type CartItemId,
  CartItemIdHelper,
  CartItemValidationError,
  type ProductId,
  type Sku,
} from './cart-item.types';

export type { CartItemId, ProductId, Sku } from './cart-item.types';
export { CartItemError, CartItemIdHelper, CartItemValidationError } from './cart-item.types';

/** Public props accepted by {@link CartItem.create}. */
export interface CartItemProps {
  id?: CartItemId | undefined;
  productId: string;
  name: string;
  sku?: string | undefined;
  unitPrice: Money;
  quantity: number;
  imageUrl?: string | undefined;
}

interface NormalizedCartItemProps {
  id: CartItemId;
  productId: ProductId;
  name: string;
  sku: Sku;
  unitPrice: Money;
  quantity: number;
  imageUrl: string | undefined;
}

const CartItemSchema = z.object({
  id: z.string().startsWith('item_').optional(),
  productId: z.string().min(1),
  name: z.string().min(1),
  sku: z.string().min(1).optional(),
  quantity: z.number().int().positive().max(999),
  imageUrl: z.string().url().optional(),
});

/**
 * CartItem Value Object
 *
 * Represents an immutable line item in a shopping cart.
 * Changes always produce new instances via factory methods.
 */
export class CartItem extends ValueObject<NormalizedCartItemProps> {
  private constructor(props: NormalizedCartItemProps) {
    super(props);
  }

  /** Creates a new CartItem with full validation. Returns a {@link Result}. */
  static create(props: CartItemProps): Result<CartItem, CartItemError> {
    const validation = CartItemSchema.safeParse(props);

    if (!validation.success) {
      return Result.err(buildValidationError(validation.error));
    }

    const { unitPrice } = props;
    if (unitPrice.amount < 0) {
      return Result.err(new CartItemValidationError('Unit price cannot be negative'));
    }

    const data = validation.data;
    const id = (data.id as CartItemId) || CartItemIdHelper.generate();
    const sku = (data.sku || data.productId) as Sku;

    return Result.ok(
      new CartItem({
        id,
        productId: data.productId as ProductId,
        name: data.name,
        sku,
        unitPrice,
        quantity: data.quantity,
        imageUrl: data.imageUrl || undefined,
      }),
    );
  }

  /**
   * Calculates the subtotal (unitPrice × quantity) with explicit error handling.
   * Prefer this over the `subtotal` getter when errors must be handled explicitly.
   */
  calculateSubtotal(): Result<Money, CartItemError> {
    const result = this._value.unitPrice.multiply(this._value.quantity);
    if (result.isFailure) {
      return Result.err(new CartItemError('Failed to calculate subtotal', 'CALCULATION_FAILED'));
    }
    return Result.ok(result.getValue());
  }

  /**
   * Subtotal convenience getter. Returns {@link Money.zero} on domain invariant violation
   * (should never happen for a valid CartItem). Prefer {@link calculateSubtotal} for
   * explicit error handling.
   */
  get subtotal(): Money {
    const result = this._value.unitPrice.multiply(this._value.quantity);
    if (result.isFailure) {
      return Money.zero(this._value.unitPrice.currency);
    }
    return result.getValue();
  }

  get id(): CartItemId {
    return this._value.id;
  }
  get productId(): ProductId {
    return this._value.productId;
  }
  get name(): string {
    return this._value.name;
  }
  get sku(): Sku {
    return this._value.sku;
  }
  get unitPrice(): Money {
    return this._value.unitPrice;
  }
  get quantity(): number {
    return this._value.quantity;
  }
  get imageUrl(): string | undefined {
    return this._value.imageUrl;
  }

  /** Returns a new CartItem with increased quantity. */
  increaseQuantity(amount = 1): Result<CartItem, CartItemError> {
    return CartItem.create({ ...this._value, quantity: this._value.quantity + amount });
  }

  /** Returns a new CartItem with decreased quantity. Fails if result would be ≤ 0. */
  decreaseQuantity(amount = 1): Result<CartItem, CartItemError> {
    if (this._value.quantity <= amount) {
      return Result.err(
        new CartItemError('Quantity would become zero or negative', 'INVALID_QUANTITY'),
      );
    }
    return CartItem.create({ ...this._value, quantity: this._value.quantity - amount });
  }

  /** Returns a new CartItem with an explicit quantity. */
  updateQuantity(quantity: number): Result<CartItem, CartItemError> {
    return CartItem.create({ ...this._value, quantity });
  }

  override equals(other: CartItem): boolean {
    return this._value.productId === other._value.productId && this._value.sku === other._value.sku;
  }

  toPrimitives() {
    return {
      id: this.id as string,
      productId: this.productId as string,
      name: this.name,
      sku: this.sku as string,
      unitPrice: this.unitPrice.toPrimitives(),
      quantity: this.quantity,
      imageUrl: this.imageUrl,
      subtotal: this.subtotal.toPrimitives(),
    };
  }
}

function buildValidationError(error: z.ZodError): CartItemError {
  const firstError = error.errors[0];
  const message = firstError?.message || 'Invalid props';
  return new CartItemValidationError(message, { errors: error.errors });
}
