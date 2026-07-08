import { db, inventory, products } from '@pranakaia/infrastructure/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { createLogger } from '@/lib/logger';

const log = createLogger({ module: 'api:cron:sync-inventory' });

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const catalog = await db
      .select({
        id: products.id,
        sku: products.sku,
        stockQuantity: products.stockQuantity,
        lowStockThreshold: products.lowStockThreshold,
      })
      .from(products);

    let createdRecords = 0;
    let updatedRecords = 0;

    for (const product of catalog) {
      const [existingInventory] = await db
        .select({ id: inventory.id })
        .from(inventory)
        .where(eq(inventory.productId, product.id))
        .limit(1);

      if (!existingInventory) {
        await db.insert(inventory).values({
          productId: product.id,
          sku: product.sku,
          quantity: product.stockQuantity,
          lowStockThreshold: product.lowStockThreshold ?? 10,
          reorderPoint: Math.max((product.lowStockThreshold ?? 10) * 2, 20),
          updatedAt: new Date(),
        });
        createdRecords += 1;
      } else {
        await db
          .update(inventory)
          .set({
            sku: product.sku,
            quantity: product.stockQuantity,
            lowStockThreshold: product.lowStockThreshold ?? 10,
            reorderPoint: Math.max((product.lowStockThreshold ?? 10) * 2, 20),
            updatedAt: new Date(),
          })
          .where(eq(inventory.id, existingInventory.id));
        updatedRecords += 1;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory sync completed',
      syncedProducts: catalog.length,
      createdRecords,
      updatedRecords,
    });
  } catch (error) {
    log.error('Inventory sync cron error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
