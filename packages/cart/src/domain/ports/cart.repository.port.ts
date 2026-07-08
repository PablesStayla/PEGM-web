import type { RepositoryPort, Result } from '@pranakaia/shared-kernel';
import type { Cart } from '../entities/cart.entity';
import type { CartId } from '../entities/cart-id.vo';

/**
 * Repository port for Cart persistence — extends the generic {@link RepositoryPort}
 * with cart-specific query methods.
 *
 * @example
 * ```ts
 * class DrizzleCartRepository implements CartRepositoryPort {
 *   async findByCustomerId(customerId: string) { ... }
 *   async findOrCreateForCustomer(customerId: string, currency?: string) { ... }
 *   // ... etc
 * }
 * ```
 */
export interface CartRepositoryPort extends RepositoryPort<Cart, CartId> {
  /**
   * Finds a cart by customer ID.
   *
   * @param customerId - The customer's identifier.
   * @returns The cart if found, or `null`.
   */
  findByCustomerId(customerId: string): Promise<Result<Cart | null, Error>>;

  /**
   * Finds a cart by session ID (for guest / anonymous users).
   *
   * @param sessionId - The session identifier.
   * @returns The cart if found, or `null`.
   */
  findBySessionId(sessionId: string): Promise<Result<Cart | null, Error>>;

  /**
   * Finds an existing cart for a customer, or creates a new one if none exists.
   *
   * @param customerId - The customer's identifier.
   * @param currency - Optional ISO 4217 currency code. Defaults to `'USD'`.
   * @returns The customer's cart.
   */
  findOrCreateForCustomer(customerId: string, currency?: string): Promise<Result<Cart, Error>>;

  /**
   * Finds an existing cart for a guest session, or creates a new one.
   *
   * @param sessionId - The session identifier.
   * @param currency - Optional ISO 4217 currency code. Defaults to `'USD'`.
   * @returns The guest's cart.
   */
  findOrCreateForSession(sessionId: string, currency?: string): Promise<Result<Cart, Error>>;

  /**
   * Deletes all expired carts and returns the count of deleted records.
   *
   * @returns The number of carts deleted.
   */
  deleteExpired(): Promise<Result<number, Error>>;

  /**
   * Merges a guest (source) cart into a customer (target) cart.
   *
   * Used when a guest user logs in and their anonymous cart needs to be
   * combined with their authenticated cart.
   *
   * @param sourceCartId - The guest cart to merge from.
   * @param targetCartId - The customer cart to merge into.
   * @returns The merged cart.
   */
  mergeCarts(sourceCartId: CartId, targetCartId: CartId): Promise<Result<Cart, Error>>;
}
