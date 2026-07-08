'use server';

/**
 * Supplier Queries for RSC
 */

import 'server-only';
import { container } from '@/providers/container';
import { unwrapAsync } from '@/providers/data/result-bridge';

export async function getSuppliersQuery() {
  return await unwrapAsync(container.supplierService.getSuppliers());
}
