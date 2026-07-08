'use server';

/**
 * Inventory Resource Actions — Thin Wrappers
 *
 * Logic:
 * 1. Validate Input (Zod)
 * 2. Validate Metadata (Action Name)
 * 3. Validate Ability (CASL)
 * 4. Delegate to Application Service (via Container)
 * 5. Unwrap Result (via ResultBridge)
 */

import { actionClient } from '@/providers/action-provider';
import { container } from '@/providers/container';
import { unwrapAsync } from '@/providers/data/result-bridge';
import { bulkUpdateStockSchema, getLowStockProductsSchema, updateStockSchema } from '../schemas';

export const bulkUpdateStockAction = actionClient
  .metadata({
    actionName: 'inventory.bulkUpdateStock',
    ability: { action: 'update', subject: 'Inventory' },
  })
  .schema(bulkUpdateStockSchema)
  .action(async ({ parsedInput }) => {
    return await unwrapAsync(
      container.inventoryService.bulkUpdateStock(parsedInput.items, parsedInput.reason),
    );
  });

export const getInventoryStatsAction = actionClient
  .metadata({
    actionName: 'inventory.getStats',
    ability: { action: 'read', subject: 'Inventory' },
  })
  .action(async () => {
    return await unwrapAsync(container.inventoryService.getInventoryStats());
  });

export const getLowStockProductsAction = actionClient
  .metadata({
    actionName: 'inventory.getLowStock',
    ability: { action: 'read', subject: 'Inventory' },
  })
  .schema(getLowStockProductsSchema)
  .action(async ({ parsedInput }) => {
    return await unwrapAsync(
      container.inventoryService.getLowStockProducts(parsedInput?.limit ?? 10),
    );
  });

export const updateStockAction = actionClient
  .metadata({
    actionName: 'inventory.updateStock',
    ability: { action: 'update', subject: 'Inventory' },
  })
  .schema(updateStockSchema)
  .action(async ({ parsedInput }) => {
    return await unwrapAsync(
      container.inventoryService.updateStock(
        parsedInput.productId,
        parsedInput.quantity,
        parsedInput.reason,
      ),
    );
  });
