import type { Cart } from '@pranakaia/cart';
import type { IProductRepository } from '@pranakaia/catalog';
import {
  AuditService,
  DomainError,
  type Money,
  type ProductId,
  Result,
} from '@pranakaia/shared-kernel';

export class CheckoutValidator {
  constructor(private readonly productRepository: IProductRepository) {}

  async validateCartContents(cart: Cart): Promise<Result<void, DomainError>> {
    if (!cart.items.length) {
      return Result.err(new DomainError('Cart is empty', 'CART_EMPTY'));
    }

    for (const item of cart.items) {
      const res = await this.validateItemPrice(item);
      if (!res.success) {
        return res;
      }
    }
    return Result.ok(undefined);
  }

  private async validateItemPrice(item: Cart['items'][number]): Promise<Result<void, DomainError>> {
    const productResult = await this.productRepository.findById(item.productId as ProductId);
    if (!productResult.success) {
      return Result.err(productResult.error as DomainError);
    }

    const product = productResult.value;
    if (!product) {
      return Result.err(new DomainError(`Product not found: ${item.name}`, 'PRODUCT_NOT_FOUND'));
    }

    if (!item.unitPrice.equals(product.price)) {
      await this.logPriceMismatch(item, product.price);
      return Result.err(
        new DomainError(`El precio de ${item.name} ha cambiado.`, 'PRICE_MISMATCH'),
      );
    }
    return Result.ok(undefined);
  }

  private async logPriceMismatch(item: { productId: string; unitPrice: Money }, expected: Money) {
    await AuditService.log({
      action: 'checkout_failed',
      entityType: 'product',
      entityId: item.productId,
      severity: 'warning',
      metadata: {
        reason: 'price_mismatch',
        expected: expected.amount,
        received: item.unitPrice.amount,
      },
    });
  }
}
