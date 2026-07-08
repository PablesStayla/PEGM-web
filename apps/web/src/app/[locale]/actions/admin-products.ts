'use server';

import type { ProductIdBrand } from '@pranakaia/domain';
import { AuditService, BackendModule } from '@pranakaia/infrastructure';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/server';

export async function getAdminProducts() {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error('Admin access required');
  }

  const backend = await BackendModule.bootstrap();
  const productRepo = backend.getProductRepository();

  const searchResult = await productRepo.findAll({});

  if (searchResult.isFailure) {
    throw searchResult.errorValue;
  }

  const { items } = searchResult.getValue();

  return items.map((p) => {
    const prim = p.toPrimitives();
    return {
      id: prim.id,
      name: prim.name,
      sku: prim.sku,
      category: prim.categoryIds[0] || 'General',
      price: {
        amount: prim.price.amount,
        currency: prim.price.currency,
      },
      salePrice: null as { amount: number; currency: string } | null,
      stock: prim.stockQuantity,
      isActive: prim.status === 'ACTIVE',
      images: prim.images,
    };
  });
}

export async function deleteProductBase(productId: string) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return { success: false, error: 'Admin access required' };
    }

    const backend = await BackendModule.bootstrap();
    const productRepo = backend.getProductRepository();

    await productRepo.delete(productId as ProductIdBrand);

    await AuditService.log({
      action: 'delete_product',
      entityType: 'product',
      entityId: productId,
      userId: admin.id,
      severity: 'warning',
      metadata: { deletedAt: new Date() },
    });

    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    await AuditService.log({
      action: 'delete_product_error',
      entityType: 'product',
      entityId: productId,
      severity: 'error',
      metadata: { error: errorMessage },
    });

    return { success: false, error: errorMessage };
  }
}

export async function duplicateProduct(_productId: string) {
  // Logic to read product, change sku/slug slightly, and insert.
  // In a full Fellow implementation, we would extract all fields and insert new.
  // We'll skip complex duplication in this immediate action set and rely on standard creation.
}
