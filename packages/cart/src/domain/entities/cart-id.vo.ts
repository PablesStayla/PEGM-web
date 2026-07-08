import { DomainError, Result } from '@pranakaia/shared-kernel';
import { z } from 'zod';

/**
 * Branded type for a Cart identifier.
 *
 * Prevents accidental mixing with other string-based IDs at compile time.
 */
export type CartId = string & { readonly __brand: 'CartId' };

const CART_ID_PREFIX = 'cart_';
const CartIdSchema = z
  .string()
  .startsWith(CART_ID_PREFIX)
  .min(CART_ID_PREFIX.length + 1);

/**
 * Error returned when a CartId fails validation.
 *
 * @example
 * ```ts
 * const result = CartId.create('invalid');
 * if (result.isFailure) {
 *   console.log(result.errorValue); // CartIdError
 * }
 * ```
 */
export class CartIdError extends DomainError {
  constructor(raw: string) {
    super(
      `Invalid CartId: "${raw}". Must start with "${CART_ID_PREFIX}" and not be empty.`,
      'INVALID_CART_ID',
    );
    this.name = 'CartIdError';
  }
}

/**
 * Factory and utility namespace for {@link CartId}.
 *
 * @example
 * ```ts
 * const id = CartId.generate();            // 'cart_1683800000_a1b2c3'
 * const parsed = CartId.create('cart_1');  // Result.ok
 * const unsafe = CartId.from('cart_legacy'); // CartId (no validation)
 * ```
 */
export const CartId = {
  /**
   * Generates a new unique CartId with timestamp + random suffix.
   *
   * @example
   * ```ts
   * const id = CartId.generate(); // 'cart_1683800000_a1b2c3'
   * ```
   */
  generate: (): CartId => {
    return `${CART_ID_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 11)}` as CartId;
  },

  /**
   * Validates and creates a CartId from a string.
   *
   * @param value - Must start with `'cart_'` and not be empty.
   * @returns `Result<CartId, CartIdError>`
   *
   * @example
   * ```ts
   * const result = CartId.create('cart_123');
   * if (result.isSuccess) { /* result.getValue() is CartId *\/ }
   * ```
   */
  create: (value: string): Result<CartId, CartIdError> => {
    const result = CartIdSchema.safeParse(value);
    if (!result.success) {
      return Result.err(new CartIdError(value));
    }
    return Result.ok(value as CartId);
  },

  /**
   * Unsafely casts a string to CartId without validation.
   * Use only when the value is guaranteed valid (e.g. from trusted persistence).
   *
   * @param value - A string that is known to be a valid CartId.
   *
   * @example
   * ```ts
   * const id = CartId.from('cart_from_db'); // CartId (no checks)
   * ```
   */
  from: (value: string): CartId => value as CartId,

  /**
   * Compares two CartIds for equality.
   *
   * @example
   * ```ts
   * CartId.equals(a, b); // boolean
   * ```
   */
  equals: (a: CartId, b: CartId): boolean => a === b,
};
