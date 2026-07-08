import type { Result } from '@pranakaia/shared-kernel';
import type { Product } from '../entities/product.entity';
import type { ProductId } from '../entities/product-id.vo';
import type { Money } from '../value-objects/money.vo';

/**
 * Search parameters for product queries with filtering and pagination.
 *
 * @example
 * ```ts
 * const params: ProductSearchParams = {
 *   query: 'camiseta',
 *   category: 'apparel',
 *   minPrice: Money.zero('CLP'),
 *   maxPrice: Money.of(50000, 'CLP').getValue(),
 *   limit: 20,
 *   offset: 0,
 * };
 * ```
 */
export interface ProductSearchParams {
  limit?: number;
  offset?: number;
  query?: string;
  category?: string;
  minPrice?: Money;
  maxPrice?: Money;
  featured?: boolean;
}

/**
 * Repository port for Product persistence.
 *
 * Extends basic CRUD with catalog-specific queries: SKU lookup,
 * full-text search, and featured product selection.
 *
 * @example
 * ```ts
 * class DrizzleProductRepository implements IProductRepository {
 *   async findBySku(sku: string) { ... }
 *   async findFeatured(limit?: number) { ... }
 *   // ... etc
 * }
 * ```
 */
export interface IProductRepository {
  /** Finds a product by its identifier. Returns `null` if not found. */
  findById(id: ProductId): Promise<Result<Product | null, Error>>;
  /** Finds a product by its SKU code. Returns `null` if not found. */
  findBySku(sku: string): Promise<Result<Product | null, Error>>;
  /** Finds all products matching the search params with pagination. */
  findAll(params: ProductSearchParams): Promise<Result<{ items: Product[]; total: number }, Error>>;
  /** Persists a product (insert or update). */
  save(product: Product): Promise<Result<void, Error>>;
  /** Deletes a product by its identifier. */
  delete(id: ProductId): Promise<Result<void, Error>>;
  /** Checks if a product with the given identifier exists. */
  exists(id: ProductId): Promise<Result<boolean, Error>>;
  /** Returns featured products up to the given limit. */
  findFeatured(limit?: number): Promise<Result<Product[], Error>>;
  /** Searches products by a free-text query. */
  searchByQuery(query: string, limit?: number): Promise<Result<Product[], Error>>;
}
