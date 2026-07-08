import type { Result } from '@pranakaia/shared-kernel';
import { inject, injectable } from 'tsyringe';
import type { Cart } from '../../../domain/entities/cart.entity';
import { CartService } from '../../cart.service';
import type { RemoveFromCartCommand } from './remove-from-cart.command';

/**
 * Use Case: Remove from Cart
 *
 * Orchestrates the removal of an item from a shopping cart.
 */
@injectable()
export class RemoveFromCartUseCase {
  constructor(@inject(CartService) readonly cartService: CartService) {}

  async execute(command: RemoveFromCartCommand): Promise<Result<Cart, Error>> {
    return this.cartService.removeItem(command.cartId, command.itemId);
  }
}

// Export as Handler for backwards compatibility with existing API controllers
export { RemoveFromCartUseCase as RemoveFromCartHandler };
