import { db } from '@pranakaia/infrastructure/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupplierService } from './supplier.service';

vi.mock('@pranakaia/infrastructure/db', () => ({
  db: { update: vi.fn() },
  stores: { id: 'id', settings: 'settings' },
}));

vi.mock('@/lib/admin/store-context', () => ({
  getAdminStoreContext: vi.fn().mockResolvedValue({ storeId: 's1', settings: { suppliers: [] } }),
  isRecord: vi.fn().mockReturnValue(true),
}));

describe('SupplierService', () => {
  let service: SupplierService;

  beforeEach(() => {
    service = new SupplierService();
    vi.clearAllMocks();
  });

  it('debe listar proveedores', async () => {
    const result = await service.getSuppliers();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual([]);
    }
  });

  it('debe crear un proveedor', async () => {
    const data = {
      name: 'Sup 1',
      email: 's1@test.com',
      apiEndpoint: 'http://api.com',
      apiKey: 'key',
      syncFrequency: 'HOURLY' as const,
      isActive: true,
    };

    (db.update as any).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(true),
      }),
    });

    const result = await service.createSupplier(data, 'admin-1');
    expect(result.success).toBe(true);
  });
});
