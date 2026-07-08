/**
 * @pranakaia/catalog — Catálogo Bounded Context
 *
 * Product catalog management for PranaKaia E-Commerce.
 * Handles products, categories, brands, and related entities.
 *
 * Screaming Architecture: domain/ → application/ → infrastructure/
 */

// ── Re-export helpers from shared-kernel ──────────────────────────────────
export { ProductIdHelper } from '@pranakaia/shared-kernel';
// ── Application ───────────────────────────────────────────────────────────
export * from './application/product.service';
export * from './application/product-dtos';
// ── Domain ────────────────────────────────────────────────────────────────
// Entities
export { Product } from './domain/entities/product.entity';
export * from './domain/entities/product-errors';
export type { ProductId } from './domain/entities/product-id.vo';
export { ProductIdError } from './domain/entities/product-id.vo';
export {
  type CreateProductProps,
  type ProductStatus,
  ProductStatusHelper,
} from './domain/entities/product-types';
// Domain Events
export {
  ProductArchived,
  ProductCreated,
  type ProductEvent,
  ProductPriceChanged,
  ProductPublished,
  ProductStockUpdated,
} from './domain/events/product.events';
// Ports (driven / secondary)
export type {
  IProductRepository,
  ProductSearchParams,
} from './domain/ports/product.repository.port';
// Value Objects
export { Money } from './domain/value-objects/money.vo';
export { SKU } from './domain/value-objects/sku.vo';
