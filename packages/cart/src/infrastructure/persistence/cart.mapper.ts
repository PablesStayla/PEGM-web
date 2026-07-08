import { type CurrencyCode, Money, Result } from '@pranakaia/shared-kernel';
import {
  Cart,
  type Currency,
  type CustomerId,
  type SessionId,
} from '../../domain/entities/cart.entity';
import type { CartId } from '../../domain/entities/cart-id.vo';
import {
  CartItem,
  type CartItemId,
  type ProductId,
  type Sku,
} from '../../domain/entities/cart-item.vo';

export interface RawCartItemRow {
  id: string;
  productId: string;
  sku: string | null;
  name: string | null;
  quantity: number;
  unitPrice: string | number;
  imageUrl?: string | null;
}

export interface RawCartRow {
  id: string;
  customerId: string | null;
  sessionId: string | null;
  currency: string;
  expiresAt: Date | string | null;
  items?: RawCartItemRow[];
}

/**
 * Maps a raw Drizzle database row (with joined items) to a Cart domain entity.
 *
 * Skips any items that fail Money or CartItem construction rather than
 * propagating partial failures — the aggregate will still be reconstituted
 * with valid items only.
 *
 * @param row - Raw row from `cartsTable` with eagerly loaded `items`.
 * @returns Result containing the Cart domain entity or an Error.
 */
export function cartToDomain(row: RawCartRow): Result<Cart, Error> {
  const items = mapRawItemsToCartItems(row.items, row.currency);

  const cartResult = Cart.create({
    id: row.id as CartId,
    customerId: (row.customerId || undefined) as CustomerId,
    sessionId: (row.sessionId || undefined) as SessionId,
    currency: row.currency as Currency,
    expiresAt: row.expiresAt
      ? typeof row.expiresAt === 'string'
        ? new Date(row.expiresAt)
        : row.expiresAt
      : undefined,
    items,
  });

  if (cartResult.isFailure) {
    return Result.err(cartResult.errorValue as Error);
  }

  return Result.ok(cartResult.getValue());
}

function mapRawItemsToCartItems(items: RawCartItemRow[] | undefined, currency: string): CartItem[] {
  const result: CartItem[] = [];
  if (!items) {
    return result;
  }

  for (const itemRow of items) {
    const item = mapRawItemToCartItem(itemRow, currency);
    if (item) {
      result.push(item);
    }
  }

  return result;
}

function mapRawItemToCartItem(itemRow: RawCartItemRow, currency: string): CartItem | null {
  if (!itemRow.sku || !itemRow.name) {
    return null;
  }

  const moneyResult = Money.create(Number(itemRow.unitPrice), currency as CurrencyCode);
  if (moneyResult.isFailure) {
    return null;
  }

  const itemResult = CartItem.create({
    id: itemRow.id as CartItemId,
    productId: itemRow.productId as ProductId,
    sku: itemRow.sku as Sku,
    name: itemRow.name,
    quantity: itemRow.quantity,
    unitPrice: moneyResult.getValue(),
    imageUrl: itemRow.imageUrl || undefined,
  });

  return itemResult.isSuccess ? itemResult.getValue() : null;
}
