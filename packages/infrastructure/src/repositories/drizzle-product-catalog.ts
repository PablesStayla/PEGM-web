import type { CatalogPort, CatalogProductInfo } from '@pranakaia/cart';
import type { ProductId } from '@pranakaia/catalog';
import { Result } from '@pranakaia/shared-kernel';
import { inject, injectable } from 'tsyringe';
import { DrizzleProductRepository } from './drizzle-product-repository';

/**
 * Implementation of CatalogPort for Cart bounding context,
 * bridging cart validation to catalog database using Hexagonal Ports.
 */
@injectable()
export class DrizzleProductCatalog implements CatalogPort {
  constructor(
    @inject(DrizzleProductRepository) readonly productRepository: DrizzleProductRepository,
  ) {}

  async getProductInfo(productId: string): Promise<Result<CatalogProductInfo, Error>> {
    const productResult = await this.productRepository.findById(productId as ProductId);

    if (productResult.isFailure) {
      return Result.err(productResult.errorValue);
    }

    const product = productResult.getValue();
    if (!product) {
      return Result.err(new Error(`Product ${productId} not found in catalog`));
    }

    const primitives = product.toPrimitives();

    const imageUrl = primitives.images?.[0];

    return Result.ok({
      productId: primitives.id,
      name: primitives.name,
      sku: primitives.sku,
      price: product.price, // Money object
      stock: primitives.stockQuantity,
      ...(imageUrl ? { imageUrl } : {}),
    });
  }
}
