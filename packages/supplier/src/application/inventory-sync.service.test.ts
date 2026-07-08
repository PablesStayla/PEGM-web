import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IInventorySource } from '../domain/dropshipping/ports/inventory-source';
import type { ISupplierRepository } from '../domain/dropshipping/ports/supplier-repository';
import type { ISupplierProductUpdater } from './inventory-sync.service';
import { InventorySyncService } from './inventory-sync.service';

describe('InventorySyncService', () => {
  let supplierRepo: ISupplierRepository;
  let inventorySource: IInventorySource;
  let productUpdater: ISupplierProductUpdater;
  let service: InventorySyncService;

  const supplierId = randomUUID();
  const mockSupplierPrimitive = {
    id: supplierId,
    name: 'Test Supplier',
    apiEndpoint: 'https://api.test',
    apiKey: 'key',
    syncFrequency: 'HOURLY' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    supplierRepo = {
      findAll: vi.fn().mockResolvedValue([mockSupplierPrimitive]),
      findById: vi.fn().mockResolvedValue(mockSupplierPrimitive),
      save: vi.fn(),
      delete: vi.fn(),
    };
    inventorySource = {
      fetchStock: vi.fn().mockResolvedValue([
        {
          supplierId,
          externalProductId: 'test-slug',
          stockLevel: 100,
          lastCheckedAt: new Date(),
        },
      ]),
    };
    productUpdater = {
      updateStock: vi.fn().mockResolvedValue(true),
      getSupplierProductCount: vi.fn().mockResolvedValue(1),
    };
    service = new InventorySyncService(supplierRepo, inventorySource, productUpdater);
  });

  it('should sync inventory for active suppliers', async () => {
    const result = await service.syncAll();

    expect(supplierRepo.findAll).toHaveBeenCalled();
    expect(inventorySource.fetchStock).toHaveBeenCalledWith(mockSupplierPrimitive);
    expect(productUpdater.updateStock).toHaveBeenCalledWith(supplierId, 'test-slug', 100);
    expect(result.totalSynced).toBe(1);
    expect(result.totalErrors).toBe(0);
  });

  it('should handle fetch errors gracefully', async () => {
    vi.mocked(inventorySource.fetchStock).mockRejectedValue(new Error('API Down'));

    const result = await service.syncAll();
    expect(result.results).toHaveLength(1);
    expect(result.results[0].errors.length).toBeGreaterThan(0);
    expect(result.totalSynced).toBe(0);
  });
});
