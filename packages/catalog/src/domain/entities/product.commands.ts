/**
 * Product Command Handlers — Catalog Bounded Context
 *
 * Standalone pure functions that apply mutations to a Product entity.
 * Extracted from {@link Product} to keep the aggregate below the 200-line limit
 * while preserving single-responsibility for each operation.
 *
 * These functions are called by {@link Product} instance methods internally.
 */

import { type DomainError, Result } from '@pranakaia/shared-kernel';
import {
  InvalidProductPriceError,
  InvalidStatusTransitionError,
  InvalidStockQuantityError,
} from '../entities/product-errors';
import type { ProductStatus } from '../entities/product-types';
import {
  ProductArchived,
  ProductPriceChanged,
  ProductPublished,
  ProductStockUpdated,
} from '../events/product.events';
import type { Money } from '../value-objects/money.vo';

/** Context passed into command handlers to allow mutation. */
export interface ProductCommandContext {
  idValue: string;
  price: Money;
  stockQuantity: number;
  status: ProductStatus;
}

/** Result of a command: updated fields + domain events to emit. */
export interface CommandResult {
  updates: Partial<{ price: Money; stockQuantity: number; status: ProductStatus }>;
  events: Array<ProductPriceChanged | ProductStockUpdated | ProductPublished | ProductArchived>;
}

/**
 * Applies a price change command to a product context.
 *
 * @param ctx - Current product state snapshot.
 * @param newPrice - The requested new price.
 */
export function applyPriceChange(
  ctx: ProductCommandContext,
  newPrice: Money,
): Result<CommandResult, DomainError> {
  if (newPrice.amount <= 0) {
    return Result.err(new InvalidProductPriceError('Price must be positive'));
  }

  if (ctx.price.equals(newPrice)) {
    return Result.ok({ updates: {}, events: [] });
  }

  return Result.ok({
    updates: { price: newPrice },
    events: [new ProductPriceChanged(ctx.idValue, ctx.price.amount, newPrice.amount)],
  });
}

/**
 * Applies a stock update command to a product context.
 *
 * @param ctx - Current product state snapshot.
 * @param quantity - New stock quantity (must be >= 0).
 */
export function applyStockUpdate(
  ctx: ProductCommandContext,
  quantity: number,
): Result<CommandResult, DomainError> {
  if (quantity < 0) {
    return Result.err(new InvalidStockQuantityError(quantity));
  }

  const oldStatus = ctx.status;
  let newStatus: ProductStatus = oldStatus;

  if (quantity === 0) {
    newStatus = 'OUT_OF_STOCK';
  } else if (oldStatus === 'OUT_OF_STOCK') {
    newStatus = 'ACTIVE';
  }

  return Result.ok({
    updates: { stockQuantity: quantity, status: newStatus },
    events: [new ProductStockUpdated(ctx.idValue, quantity, oldStatus, newStatus)],
  });
}

/**
 * Applies a publish command to a product context.
 *
 * @param ctx - Current product state snapshot.
 */
export function applyPublish(ctx: ProductCommandContext): Result<CommandResult, DomainError> {
  if (ctx.stockQuantity === 0) {
    return Result.err(
      new InvalidStatusTransitionError(
        ctx.status,
        'ACTIVE',
        'Cannot publish product with zero stock',
      ),
    );
  }

  return Result.ok({
    updates: { status: 'ACTIVE' },
    events: [new ProductPublished(ctx.idValue)],
  });
}

/**
 * Applies an archive command to a product context.
 *
 * @param ctx - Current product state snapshot.
 */
export function applyArchive(ctx: ProductCommandContext): Result<CommandResult, DomainError> {
  return Result.ok({
    updates: { status: 'ARCHIVED' },
    events: [new ProductArchived(ctx.idValue)],
  });
}
