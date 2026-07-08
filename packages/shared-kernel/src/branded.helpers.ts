import type { OrderId, ProductId } from './branded';
import { DomainError, Result } from './domain/result';

/** Base error for invalid branded ID values. */
export class BrandedIdError extends DomainError {
  constructor(entity: string, raw: unknown, message?: string) {
    super(message || `Invalid ${entity} identifier: "${String(raw)}"`, 'INVALID_BRANDED_ID', {
      entity,
      raw,
    });
    this.name = 'BrandedIdError';
  }
}

/** Error for invalid ProductId values. */
export class ProductIdError extends BrandedIdError {
  constructor(raw: unknown) {
    super('ProductId', raw, `Invalid ProductId format: "${String(raw)}". Must start with "prod_".`);
    this.name = 'ProductIdError';
  }
}

/** Factory helpers for ProductId. */
export const ProductIdHelper = {
  generate: (): ProductId => {
    return `prod_${Date.now()}_${Math.random().toString(36).substring(2, 11)}` as ProductId;
  },
  create: (value: string): Result<ProductId, ProductIdError> => {
    const trimmed = value?.trim();
    if (!trimmed) {
      return Result.err(new ProductIdError(value));
    }
    return Result.ok(trimmed as ProductId);
  },
  from: (value: string): ProductId => value as ProductId,
  equals: (a: ProductId, b: ProductId): boolean => a === b,
};

/** Factory helpers for OrderId. */
export const OrderIdHelper = {
  generate: (): OrderId => {
    return `order_${Date.now()}_${Math.random().toString(36).substring(2, 11)}` as OrderId;
  },
  create: (value: string): Result<OrderId, BrandedIdError> => {
    const trimmed = value?.trim();
    if (!trimmed) {
      return Result.err(new BrandedIdError('OrderId', value));
    }
    return Result.ok(trimmed as OrderId);
  },
  from: (value: string): OrderId => value as OrderId,
  equals: (a: OrderId, b: OrderId): boolean => a === b,
};
