import type { ProductId } from '@pranakaia/catalog';
import type { IInventoryRepository } from '@pranakaia/inventory';
import { Inventory, type InventoryId } from '@pranakaia/inventory';
import { Result } from '@pranakaia/shared-kernel';
import { and, eq, gte, sql } from 'drizzle-orm';
import { db, inventory } from '../db';

/**
 * Drizzle implementation of the IInventoryRepository.
 * Uses atomic PostgreSQL operations and row-level locking patterns via Invariant Where clauses
 * to ensure consistency in stock reservations.
 */
export class DrizzleInventoryRepository implements IInventoryRepository {
  async findByProductId(productId: ProductId): Promise<Result<Inventory | null>> {
    try {
      const rows = await db
        .select()
        .from(inventory)
        .where(eq(inventory.productId, productId))
        .limit(1);

      if (rows.length === 0 || !rows[0]) {
        return Result.ok(null);
      }
      return Result.ok(this.mapToEntity(rows[0]));
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async findById(id: InventoryId): Promise<Result<Inventory | null>> {
    try {
      const rows = await db.select().from(inventory).where(eq(inventory.id, id)).limit(1);

      if (rows.length === 0 || !rows[0]) {
        return Result.ok(null);
      }
      return Result.ok(this.mapToEntity(rows[0]));
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async save(entity: Inventory): Promise<Result<void>> {
    try {
      const primitives = entity.toPrimitives();
      await db
        .insert(inventory)
        .values({
          id: primitives.id,
          productId: primitives.productId,
          sku: primitives.sku,
          quantity: primitives.quantity,
          reservedQuantity: primitives.reserved,
          lowStockThreshold: primitives.safetyStock,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: inventory.id,
          set: {
            quantity: primitives.quantity,
            reservedQuantity: primitives.reserved,
            lowStockThreshold: primitives.safetyStock,
            updatedAt: new Date(),
          },
        });
      return Result.ok(undefined);
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async reserveStock(productId: ProductId, quantity: number): Promise<Result<boolean>> {
    try {
      const result = await db
        .update(inventory)
        .set({
          quantity: sql`${inventory.quantity} - ${quantity}`,
          reservedQuantity: sql`${inventory.reservedQuantity} + ${quantity}`,
          updatedAt: new Date(),
        })
        .where(and(eq(inventory.productId, productId), gte(inventory.quantity, quantity)))
        .returning({ id: inventory.id });

      return Result.ok(result.length > 0);
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async releaseStock(productId: ProductId, quantity: number): Promise<Result<void>> {
    try {
      await db
        .update(inventory)
        .set({
          quantity: sql`${inventory.quantity} + ${quantity}`,
          reservedQuantity: sql`${inventory.reservedQuantity} - ${quantity}`,
          updatedAt: new Date(),
        })
        .where(and(eq(inventory.productId, productId), gte(inventory.reservedQuantity, quantity)));
      return Result.ok(undefined);
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async consumeStock(productId: ProductId, quantity: number): Promise<Result<void>> {
    try {
      await db
        .update(inventory)
        .set({
          reservedQuantity: sql`${inventory.reservedQuantity} - ${quantity}`,
          updatedAt: new Date(),
        })
        .where(and(eq(inventory.productId, productId), gte(inventory.reservedQuantity, quantity)));
      return Result.ok(undefined);
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  private mapToEntity(row: typeof inventory.$inferSelect): Inventory {
    return Inventory.reconstitute({
      id: row.id as InventoryId,
      productId: row.productId as ProductId,
      sku: row.sku,
      quantity: row.quantity,
      reserved: row.reservedQuantity,
      safetyStock: row.lowStockThreshold || 0,
      location: 'default',
      lastSyncAt: row.updatedAt,
    });
  }
}
