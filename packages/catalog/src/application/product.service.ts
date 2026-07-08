import { ProductIdHelper, Result } from '@pranakaia/shared-kernel';
import { type IProductRepository, Product, type ProductSearchParams, SKU } from '../index';
import {
  applyUpdates,
  ensureMoneyResult,
  getRepo,
  getRequiredProduct,
  logAudit,
} from './product.service.helpers';
import type { CreateProductDto, SaveAggregate, UpdateProductDto } from './product-dtos';

/**
 * Application service for product lifecycle operations.
 *
 * Orchestrates creation, updates, status toggling, and listing
 * with audit logging and transactional safety.
 * Read-heavy reporting queries are intentionally left to the repository layer.
 */
export class ProductService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly saveAggregate: SaveAggregate,
  ) {}

  async getProduct(id: string): Promise<Result<Product | null, Error>> {
    return this.productRepository.findById(ProductIdHelper.from(id));
  }

  async createProduct(
    dto: CreateProductDto,
    userId?: string,
    correlationId?: string,
  ): Promise<Result<Product, Error>> {
    const priceRes = ensureMoneyResult(dto.price);
    if (!priceRes.success) {
      return Result.err(priceRes.errorValue);
    }

    const skuRes = SKU.create(dto.sku);
    if (!skuRes.success) {
      return Result.err(skuRes.errorValue);
    }

    const result = await this.executeCreateTransaction(dto, priceRes.getValue(), skuRes.getValue());
    if (result.success) {
      await logAudit(
        'product_created',
        result.getValue().idValue,
        userId,
        { sku: result.getValue().sku.value },
        correlationId,
      );
    }
    return result;
  }

  private async executeCreateTransaction(
    dto: CreateProductDto,
    price: any,
    sku: SKU,
  ): Promise<Result<Product, Error>> {
    const { categoryIds, ...cleanDto } = dto;
    const categoryIdsVal = categoryIds ?? [];
    const imagesVal = cleanDto.images ?? [];
    const stockVal = cleanDto.stock ?? 0;

    const productRes = Product.create({
      id: ProductIdHelper.generate(),
      name: cleanDto.name,
      description: cleanDto.description,
      sku,
      price,
      categoryIds: categoryIdsVal,
      images: imagesVal,
      stockQuantity: stockVal,
    });

    if (!productRes.success) {
      return Result.err(productRes.errorValue as Error);
    }

    const product = productRes.getValue();

    return this.saveAggregate(async (tx) => {
      const repo = getRepo(this.productRepository, tx);
      const saveRes = await repo.save(product);
      if (!saveRes.success) {
        return Result.err(saveRes.errorValue as Error);
      }
      return Result.ok(product);
    });
  }

  async updateProduct(
    id: string,
    updates: UpdateProductDto,
    userId?: string,
    correlationId?: string,
  ): Promise<Result<Product, Error>> {
    const productRes = await getRequiredProduct(this.productRepository, id);
    if (!productRes.success) {
      return Result.err(productRes.errorValue);
    }

    const existing = productRes.getValue();
    const applyRes = applyUpdates(existing, updates);
    if (!applyRes.success) {
      return Result.err(applyRes.errorValue);
    }

    const saveResult = await this.productRepository.save(existing);
    if (!saveResult.success) {
      return Result.err(saveResult.errorValue);
    }

    await logAudit('product_updated', id, userId, { sku: existing.sku.value }, correlationId);
    return Result.ok(existing);
  }

  async toggleProductStatus(
    id: string,
    isActive: boolean,
    userId?: string,
    correlationId?: string,
  ): Promise<Result<void, any>> {
    const productRes = await getRequiredProduct(this.productRepository, id);
    if (!productRes.success) {
      return Result.err(productRes.errorValue);
    }
    const existing = productRes.getValue();
    isActive ? existing.publish() : existing.archive();

    const saveResult = await this.productRepository.save(existing);
    if (saveResult.success) {
      await logAudit(
        'product_updated',
        id,
        userId,
        { statusChange: isActive },
        correlationId,
        'warning',
      );
    }
    return saveResult.success ? Result.ok(undefined) : Result.err(saveResult.errorValue);
  }

  async listProducts(
    params?: ProductSearchParams,
  ): Promise<Result<{ items: readonly Product[]; total: number }, Error>> {
    return this.productRepository.findAll(params || {}) as unknown as Promise<
      Result<{ items: readonly Product[]; total: number }, Error>
    >;
  }
}
