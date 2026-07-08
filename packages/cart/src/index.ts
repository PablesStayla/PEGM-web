/**
 * @pranakaia/cart — Cart Bounded Context
 *
 * Shopping cart management for PranaKaia E-Commerce.
 *
 * Screaming Architecture: domain/ → application/ → infrastructure/
 */

// ── Application ───────────────────────────────────────────────────────────
export * from './application/cart.service';
export * from './application/commands/add-to-cart/add-to-cart.command';
export * from './application/commands/add-to-cart/add-to-cart.use-case';
export * from './application/commands/remove-from-cart/remove-from-cart.command';
export * from './application/commands/remove-from-cart/remove-from-cart.use-case';
export type { CreateCartProps } from './domain/entities/cart.entity';
// ── Domain ────────────────────────────────────────────────────────────────
export {
  Cart,
  type Currency,
  type CustomerId,
  type SessionId,
} from './domain/entities/cart.entity';
export { CartId } from './domain/entities/cart-id.vo';
export {
  CartItem,
  type CartItemId,
  CartItemIdHelper,
  type CartItemProps,
  type ProductId,
  type Sku,
} from './domain/entities/cart-item.vo';
export * from './domain/events/cart.events';
export type { CartRepositoryPort } from './domain/ports/cart.repository.port';
export type { CatalogPort, CatalogProductInfo } from './domain/ports/catalog.port';

// ── Infrastructure ────────────────────────────────────────────────────────
export * from './infrastructure/persistence/drizzle-cart.repository';
