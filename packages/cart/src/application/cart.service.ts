import { Result } from '@pranakaia/shared-kernel';
import { inject, injectable } from 'tsyringe';
import type { Cart } from '../domain/entities/cart.entity';
import type { CartId } from '../domain/entities/cart-id.vo';
import type { CartItem, CartItemId } from '../domain/entities/cart-item.vo';
import type { CartRepositoryPort } from '../domain/ports/cart.repository.port';

@injectable()
export class CartService {
  constructor(@inject('CartRepository') readonly cartRepository: CartRepositoryPort) {}

  /**
   * Retrieves a cart by ID.
   */
  async getCart(cartId: CartId): Promise<Result<Cart | null, Error>> {
    return this.cartRepository.findById(cartId);
  }

  /**
   * Retrieves a cart by customer ID.
   */
  async getCartByCustomer(customerId: string): Promise<Result<Cart | null, Error>> {
    return this.cartRepository.findByCustomerId(customerId);
  }

  /**
   * Retrieves a cart by session ID.
   */
  async getCartBySession(sessionId: string): Promise<Result<Cart | null, Error>> {
    return this.cartRepository.findBySessionId(sessionId);
  }

  /**
   * Adds an item to a cart.
   */
  async addItem(cartId: CartId, item: CartItem): Promise<Result<Cart, Error>> {
    const cartResult = await this.cartRepository.findById(cartId);
    if (cartResult.isFailure) {
      return Result.err(cartResult.errorValue);
    }

    const cart = cartResult.getValue();
    if (!cart) {
      return Result.err(new Error(`Cart ${cartId} not found`));
    }

    const addResult = cart.addItem(item);
    if (addResult.isFailure) {
      return Result.err(addResult.errorValue as Error);
    }

    const saveResult = await this.cartRepository.save(cart);
    if (saveResult.isFailure) {
      return Result.err(saveResult.errorValue);
    }

    return Result.ok(cart);
  }

  /**
   * Updates an item quantity in a cart.
   */
  async updateQuantity(
    cartId: CartId,
    itemId: CartItemId,
    quantity: number,
  ): Promise<Result<Cart, Error>> {
    const cartResult = await this.cartRepository.findById(cartId);
    if (cartResult.isFailure) {
      return Result.err(cartResult.errorValue);
    }

    const cart = cartResult.getValue();
    if (!cart) {
      return Result.err(new Error(`Cart ${cartId} not found`));
    }

    const updateResult = cart.updateItemQuantity(itemId, quantity);
    if (updateResult.isFailure) {
      return Result.err(updateResult.errorValue as Error);
    }

    const saveResult = await this.cartRepository.save(cart);
    if (saveResult.isFailure) {
      return Result.err(saveResult.errorValue);
    }

    return Result.ok(cart);
  }

  /**
   * Removes an item from a cart.
   */
  async removeItem(cartId: CartId, itemId: CartItemId): Promise<Result<Cart, Error>> {
    const cartResult = await this.cartRepository.findById(cartId);
    if (cartResult.isFailure) {
      return Result.err(cartResult.errorValue);
    }

    const cart = cartResult.getValue();
    if (!cart) {
      return Result.err(new Error(`Cart ${cartId} not found`));
    }

    const removeResult = cart.removeItem(itemId);
    if (removeResult.isFailure) {
      return Result.err(removeResult.errorValue as Error);
    }

    const saveResult = await this.cartRepository.save(cart);
    if (saveResult.isFailure) {
      return Result.err(saveResult.errorValue);
    }

    return Result.ok(cart);
  }

  /**
   * Clears a cart.
   */
  async clearCart(cartId: CartId): Promise<Result<void, Error>> {
    const cartResult = await this.cartRepository.findById(cartId);
    if (cartResult.isFailure) {
      return Result.err(cartResult.errorValue);
    }

    const cart = cartResult.getValue();
    if (!cart) {
      return Result.ok(undefined);
    }

    cart.clear();
    return this.cartRepository.save(cart);
  }

  /**
   * Merges a guest cart into a customer cart.
   */
  async mergeCarts(sourceCartId: CartId, targetCartId: CartId): Promise<Result<Cart, Error>> {
    return this.cartRepository.mergeCarts(sourceCartId, targetCartId);
  }

  /**
   * Ensures a cart exists for a customer.
   */
  async ensureCartForCustomer(customerId: string, currency?: string): Promise<Result<Cart, Error>> {
    return this.cartRepository.findOrCreateForCustomer(customerId, currency);
  }

  /**
   * Ensures a cart exists for a session.
   */
  async ensureCartForSession(sessionId: string, currency?: string): Promise<Result<Cart, Error>> {
    return this.cartRepository.findOrCreateForSession(sessionId, currency);
  }
}
