'use server';

import type { OrderIdBrand } from '@pranakaia/domain';
import { AuditService, BackendModule } from '@pranakaia/infrastructure';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/server';

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerId: string | null;
  guestEmail: string | null;
  createdAt: string;
  totalAmount: {
    amount: number;
    currency: string;
  };
  status: string;
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error('Admin access required');
  }

  const backend = await BackendModule.bootstrap();
  const orderRepo = backend.getOrderRepository();

  const rawOrdersResult = await orderRepo.findAll({
    limit: 100,
  });

  if (rawOrdersResult.isFailure) {
    throw rawOrdersResult.errorValue;
  }

  const rawOrders = rawOrdersResult.getValue();

  return rawOrders.map((o) => {
    const row = o as Record<string, unknown>;
    const createdAt = row['createdAt'];

    return {
      id: String(row['id'] ?? ''),
      orderNumber: String(row['orderNumber'] ?? ''),
      customerId: row['userId'] ? String(row['userId']) : null,
      guestEmail: row['guestEmail'] ? String(row['guestEmail']) : null,
      createdAt: createdAt instanceof Date ? createdAt.toISOString() : String(createdAt ?? ''),
      totalAmount: {
        amount: Number(row['total'] ?? 0),
        currency: typeof row['currency'] === 'string' ? row['currency'] : 'CLP',
      },
      status: String(row['status'] ?? 'PENDING'),
    };
  });
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return { success: false, error: 'Admin access required' };
    }

    const backend = await BackendModule.bootstrap();
    const orderRepo = backend.getOrderRepository();

    await orderRepo.updateStatus(orderId as OrderIdBrand, newStatus);

    await AuditService.log({
      action: 'update_order_status',
      entityType: 'order',
      entityId: orderId,
      userId: admin.id,
      severity: 'info',
      newData: { status: newStatus },
    });

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    await AuditService.log({
      action: 'update_order_status_error',
      entityType: 'order',
      entityId: orderId,
      severity: 'error',
      metadata: { error: errorMessage },
    });

    return { success: false, error: errorMessage };
  }
}
