'use server';

/**
 * Supplier Resource Actions — Thin Wrappers
 */

import { actionClient } from '@/providers/action-provider';
import { container } from '@/providers/container';
import { unwrapAsync } from '@/providers/data/result-bridge';
import { createSupplierSchema, toggleSupplierSchema } from './schemas';

export const getSuppliersAction = actionClient
  .metadata({
    actionName: 'suppliers.list',
    ability: { action: 'read', subject: 'Supplier' },
  })
  .action(async () => {
    return await unwrapAsync(container.supplierService.getSuppliers());
  });

export const createSupplierAction = actionClient
  .metadata({
    actionName: 'suppliers.create',
    ability: { action: 'create', subject: 'Supplier' },
  })
  .schema(createSupplierSchema)
  .action(async ({ parsedInput, ctx }) => {
    return await unwrapAsync(
      container.supplierService.createSupplier(parsedInput, ctx.sessionUser.id),
    );
  });

export const toggleSupplierAction = actionClient
  .metadata({
    actionName: 'suppliers.toggle',
    ability: { action: 'update', subject: 'Supplier' },
  })
  .schema(toggleSupplierSchema)
  .action(async ({ parsedInput, ctx }) => {
    return await unwrapAsync(
      container.supplierService.toggleSupplier(
        parsedInput.id,
        parsedInput.active,
        ctx.sessionUser.id,
      ),
    );
  });
