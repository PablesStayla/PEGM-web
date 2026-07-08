import 'reflect-metadata';
import type { DrizzleDB } from '@pranakaia/db';
import { cartsTable } from '@pranakaia/db';
import { Result } from '@pranakaia/shared-kernel';
import { eq, sql } from 'drizzle-orm';
import { inject, injectable } from 'tsyringe';
import { Cart } from '../../domain/entities/cart.entity';
import { CartId } from '../../domain/entities/cart-id.vo';
import type { CartRepositoryPort } from '../../domain/ports/cart.repository.port';
import { cartToDomain } from './cart.mapper';
import {
  type DrizzleTx,
  findSourceAndTargetCarts,
  persistCart,
  toError,
} from './drizzle-cart.helpers';

@injectable()
export class DrizzleCartRepository implements CartRepositoryPort {
  constructor(@inject('Database') readonly _db: DrizzleDB) {}

  private get db(): DrizzleDB {
    return this._db;
  }

  async findById(id: CartId): Promise<Result<Cart | null, Error>> {
    try {
      const cartRow = await this.db.query.cartsTable.findFirst({
        where: eq(cartsTable.id, id),
        with: { items: true },
      });

      if (!cartRow) {
        return Result.ok(null);
      }
      return cartToDomain(cartRow);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to find cart'));
    }
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<Result<Cart[], Error>> {
    try {
      const { limit, offset } = options || {};
      const rows = await this.db.query.cartsTable.findMany({
        limit,
        offset,
        with: { items: true },
      });

      const carts: Cart[] = [];
      for (const row of rows) {
        const domainResult = cartToDomain(row);
        if (domainResult.isSuccess) {
          carts.push(domainResult.getValue());
        }
      }

      return Result.ok(carts);
    } catch (error) {
      return Result.err(toError(error, 'Failed to find all carts'));
    }
  }

  async findByCustomerId(customerId: string): Promise<Result<Cart | null, Error>> {
    try {
      const cartRow = await this.db.query.cartsTable.findFirst({
        where: eq(cartsTable.customerId, customerId),
        with: { items: true },
      });

      if (!cartRow) {
        return Result.ok(null);
      }
      return cartToDomain(cartRow);
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error('Failed to find cart by customer ID'),
      );
    }
  }

  async findBySessionId(sessionId: string): Promise<Result<Cart | null, Error>> {
    try {
      const cartRow = await this.db.query.cartsTable.findFirst({
        where: eq(cartsTable.sessionId, sessionId),
        with: { items: true },
      });

      if (!cartRow) {
        return Result.ok(null);
      }
      return cartToDomain(cartRow);
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error('Failed to find cart by session ID'),
      );
    }
  }

  async findOrCreateForCustomer(
    customerId: string,
    currency = 'USD',
  ): Promise<Result<Cart, Error>> {
    const existingResult = await this.findByCustomerId(customerId);
    if (existingResult.isSuccess && existingResult.getValue()) {
      return Result.ok(existingResult.getValue()!);
    }

    const cartId = CartId.generate();
    const cartResult = Cart.create({ id: cartId, customerId, currency });

    if (cartResult.isFailure) {
      return Result.err(cartResult.errorValue as Error);
    }

    const cart = cartResult.getValue();
    const saveResult = await this.save(cart);
    if (saveResult.isFailure) {
      return Result.err(saveResult.errorValue);
    }

    return Result.ok(cart);
  }

  async findOrCreateForSession(sessionId: string, currency = 'USD'): Promise<Result<Cart, Error>> {
    const existingResult = await this.findBySessionId(sessionId);
    if (existingResult.isSuccess && existingResult.getValue()) {
      return Result.ok(existingResult.getValue()!);
    }

    const cartId = CartId.generate();
    const cartResult = Cart.create({ id: cartId, sessionId, currency });

    if (cartResult.isFailure) {
      return Result.err(cartResult.errorValue as Error);
    }

    const cart = cartResult.getValue();
    const saveResult = await this.save(cart);
    if (saveResult.isFailure) {
      return Result.err(saveResult.errorValue);
    }

    return Result.ok(cart);
  }

  async save(cart: Cart): Promise<Result<void, Error>> {
    try {
      await this.db.transaction(async (tx: DrizzleTx) => {
        await persistCart(cart, tx);
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to save cart'));
    }
  }

  async delete(id: CartId): Promise<Result<void, Error>> {
    try {
      await this.db.delete(cartsTable).where(eq(cartsTable.id, id));
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to delete cart'));
    }
  }

  async exists(id: CartId): Promise<Result<boolean, Error>> {
    const result = await this.findById(id);
    if (result.isFailure) {
      return Result.err(result.errorValue);
    }
    return Result.ok(result.getValue() !== null);
  }

  async deleteExpired(): Promise<Result<number, Error>> {
    try {
      const now = new Date();
      const result = await this.db.delete(cartsTable).where(sql`${cartsTable.expiresAt} < ${now}`);
      const res = result as unknown as { rowCount?: number; count?: number };
      const rowCount = res.rowCount ?? res.count ?? 0;
      return Result.ok(rowCount);
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error('Failed to delete expired carts'),
      );
    }
  }

  async mergeCarts(sourceCartId: CartId, targetCartId: CartId): Promise<Result<Cart, Error>> {
    try {
      const cartsResult = await findSourceAndTargetCarts(this, sourceCartId, targetCartId);
      if (cartsResult.isFailure) {
        return Result.err(cartsResult.errorValue);
      }

      const { sourceCart, targetCart } = cartsResult.getValue();
      for (const item of sourceCart.items) {
        targetCart.addItem(item);
      }

      await this.db.transaction(async (tx: DrizzleTx) => {
        await persistCart(targetCart, tx);
        await tx.delete(cartsTable).where(eq(cartsTable.id, sourceCartId));
      });

      return Result.ok(targetCart);
    } catch (error) {
      return Result.err(toError(error, 'Failed to merge carts'));
    }
  }
}
