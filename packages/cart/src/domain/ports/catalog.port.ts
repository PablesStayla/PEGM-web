import type { Money, Result } from '@pranakaia/shared-kernel';

/**
 * Product information retrieved from the Catalog Bounded Context.
 *
 * Used by the cart context to validate items before adding them.
 *
 * @example
 * ```ts
 * const info: CatalogProductInfo = {
 *   productId: 'prod_123',
 *   name: 'Camiseta Eco',
 *   sku: 'CAM-ECO-M',
 *   price: Money.zero('CLP'),
 *   stock: 42,
 * };
 * ```
 */
export interface CatalogProductInfo {
  productId: string;
  name: string;
  sku: string;
  price: Money;
  stock: number;
  imageUrl?: string;
}

/**
 * Port for interacting with the Catalog Bounded Context.
 *
 * Provides read-only access to product data from the cart context
 * without creating a direct package dependency.
 *
 * @example
 * ```ts
 * class CatalogAdapter implements CatalogPort {
 *   async getProductInfo(productId: string): Promise<Result<CatalogProductInfo, Error>> {
 *     // calls catalog infrastructure or API
 *   }
 * }
 * ```
 */
export interface CatalogPort {
  /**
   * Retrieves product information and current stock level.
   *
   * @param productId - The product identifier to look up.
   * @returns Product info with price and stock, or an error.
   */
  getProductInfo(productId: string): Promise<Result<CatalogProductInfo, Error>>;
}
