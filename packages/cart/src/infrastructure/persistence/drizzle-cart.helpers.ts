import { cartItemsTable, cartsTable } from '@pranakaia/db';
import { Result } from '@pranakaia/shared-kernel';
import { eq } from 'drizzle-orm';
import type { Cart } from '../../domain/entities/cart.entity';
import type { CartId } from '../../domain/entities/cart-id.vo';

export type DrizzleTx = Parameters<typeof import('@pranakaia/db').db['transaction']>[0] extends (
  tx: infer T,
) => Promise<unknown>
  ? T
  : never;

export function toError(error: unknown, defaultMsg: string): Error {
  return error instanceof Error ? error : new Error(defaultMsg);
}

/**
 * Persists the Cart aggregate and its elements as a database transaction.
 */
export async function persistCart(cart: Cart, tx: DrizzleTx): Promise<void> {
  const primitives = cart.toPrimitives();

  await tx
    .insert(cartsTable)
    .values({
      id: primitives.id,
      customerId: primitives.customerId,
      sessionId: primitives.sessionId,
      currency: primitives.currency,
      expiresAt: new Date(primitives.expiresAt),
      createdAt: new Date(primitives.createdAt),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: cartsTable.id,
      set: {
        customerId: primitives.customerId,
        sessionId: primitives.sessionId,
        currency: primitives.currency,
        expiresAt: new Date(primitives.expiresAt),
        updatedAt: new Date(),
      },
    });

  // Sync items via delete-and-reinsert (simpler than selective update for a cart)
  await tx.delete(cartItemsTable).where(eq(cartItemsTable.cartId, primitives.id));

  const itemsToInsert = cart.items.map((item) => ({
    id: item.id,
    cartId: primitives.id,
    productId: item.productId,
    sku: item.sku,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice.amount.toString(),
    imageUrl: item.imageUrl,
    updatedAt: new Date(),
  }));

  if (itemsToInsert.length > 0) {
    await tx.insert(cartItemsTable).values(itemsToInsert);
  }
}

/**
 * Queries and validates the source and target Carts for a merge operation.
 */
export async function findSourceAndTargetCarts(
  repo: { findById(id: CartId): Promise<Result<Cart | null, Error>> },
  sourceCartId: CartId,
  targetCartId: CartId,
): Promise<Result<{ sourceCart: Cart; targetCart: Cart }, Error>> {
  const [sourceResult, targetResult] = await Promise.all([
    repo.findById(sourceCartId),
    repo.findById(targetCartId),
  ]);

  if (sourceResult.isFailure) {
    return Result.err(sourceResult.errorValue);
  }
  if (targetResult.isFailure) {
    return Result.err(targetResult.errorValue);
  }

  const sourceCart = sourceResult.getValue();
  const targetCart = targetResult.getValue();

  if (!sourceCart) {
    return Result.err(new Error('Source cart not found'));
  }
  if (!targetCart) {
    return Result.err(new Error('Target cart not found'));
  }

  return Result.ok({ sourceCart, targetCart });
}
