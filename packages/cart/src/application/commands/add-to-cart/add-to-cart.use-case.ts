import { Result } from '@pranakaia/shared-kernel';
import { inject, injectable } from 'tsyringe';
import type { Cart } from '../../../domain/entities/cart.entity';
import { CartItem } from '../../../domain/entities/cart-item.vo';
import type { CatalogPort } from '../../../domain/ports/catalog.port';
import { CartService } from '../../cart.service';
import type { AddToCartCommand } from './add-to-cart.command';

/**
 * Use Case: Add to Cart
 *
 * Orchestrates the process of adding an item to a shopping cart.
 * It retrieves product information from the catalog, validates stock,
 * ensures a cart exists for the user, and adds the item.
 */
@injectable()
export class AddToCartUseCase {
  constructor(
    @inject(CartService) readonly cartService: CartService,
    @inject('CatalogPort') readonly catalogPort: CatalogPort,
  ) {}

  async execute(command: AddToCartCommand): Promise<Result<Cart, Error>> {
    // 1. Retrieve current product info from Catalog
    const productResult = await this.catalogPort.getProductInfo(command.productId);
    if (productResult.isFailure) {
      return Result.err(productResult.errorValue);
    }

    const product = productResult.getValue();

    // 2. Business Rule: Basic stock check (Inventory context would handle this deeper)
    if (product.stock < command.quantity) {
      return Result.err(
        new Error(
          `Insufficient stock for "${product.name}". Requested: ${command.quantity}, Available: ${product.stock}`,
        ),
      );
    }

    // 3. Ensure a cart exists for this customer/session
    const cartResult = command.customerId
      ? await this.cartService.ensureCartForCustomer(command.customerId, command.currency)
      : await this.cartService.ensureCartForSession(command.sessionId!, command.currency);

    if (cartResult.isFailure) {
      return Result.err(cartResult.errorValue);
    }

    const cart = cartResult.getValue();

    // 4. Instantiate the domain Value Object for the item
    const itemResult = CartItem.create({
      productId: product.productId,
      name: product.name,
      sku: product.sku,
      unitPrice: product.price,
      quantity: command.quantity,
      imageUrl: product.imageUrl,
    });

    if (itemResult.isFailure) {
      return Result.err(itemResult.errorValue as Error);
    }

    // 5. Delegate the addition to the CartService (which handles persistence and entity rules)
    return this.cartService.addItem(cart.id, itemResult.getValue());
  }
}

// Export as Handler for backwards compatibility with existing API controllers
export { AddToCartUseCase as AddToCartHandler };
