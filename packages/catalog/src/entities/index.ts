// Re-exports for backward compatibility — files moved to domain/entities/
export { Product } from '../domain/entities/product.entity';
export * from '../domain/entities/product-errors';
export type { ProductId } from '../domain/entities/product-id.vo';
export { ProductIdError } from '../domain/entities/product-id.vo';
export {
  type CreateProductProps,
  type ProductStatus,
  ProductStatusHelper,
} from '../domain/entities/product-types';
