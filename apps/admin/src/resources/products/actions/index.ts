import { actionClient } from '@/providers/action-provider';
import { container } from '@/providers/container';
import { unwrapAsync } from '@/providers/data/result-bridge';
import { getAdminProductsSchema, toggleProductActiveSchema } from './types';

/**
 * Get admin products with pagination and filters
 */
export const getAdminProductsAction = actionClient
  .metadata({
    actionName: 'products.list',
    ability: { action: 'read', subject: 'Product' },
  })
  .schema(getAdminProductsSchema)
  .action(async ({ parsedInput: filters }) => {
    return await unwrapAsync(container.adminProductService.getAdminProducts(filters as any));
  });

/**
 * Toggle product active status
 */
export const toggleProductActiveAction = actionClient
  .metadata({
    actionName: 'products.toggleActive',
    ability: { action: 'update', subject: 'Product' },
  })
  .schema(toggleProductActiveSchema)
  .action(async ({ parsedInput, ctx }) => {
    return await unwrapAsync(
      container.adminProductService.toggleProductActive(
        parsedInput.productId,
        parsedInput.active,
        ctx.sessionUser.id,
      ),
    );
  });
