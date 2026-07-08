import type { ISupplierRepository } from '@pranakaia/supplier';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupplierService } from './supplier.service';

describe('SupplierService', () => {
  let supplierRepository: vi.Mocked<ISupplierRepository>;
  let service: SupplierService;

  beforeEach(() => {
    supplierRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    } as any;

    service = new SupplierService(supplierRepository);
  });

  it('should create a supplier', async () => {
    const dto = {
      tenantId: 'tenant-1',
      name: 'BigBuy',
      slug: 'bigbuy',
      email: 'support@bigbuy.eu',
      contactEmail: 'support@bigbuy.eu',
      businessType: 'DROPSHIPPER' as const,
      country: 'ES',
      type: 'dropshipping' as const,
    };

    const result = await service.createSupplier(dto as any);

    expect(result.isSuccess).toBe(true);
    const supplier = result.getValue();
    expect(supplier.name).toBe(dto.name);
    expect(supplier.id).toBeDefined();
    expect(supplierRepository.save).toHaveBeenCalled();
  });

  it('should get a supplier by id', async () => {
    const supplierProps = { id: 's1', name: 'Supplier 1' };
    const supplier = { toPrimitives: () => supplierProps };
    supplierRepository.findById.mockResolvedValue(supplier as any);

    const result = await service.getSupplier('s1');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(supplierProps);
    expect(supplierRepository.findById).toHaveBeenCalledWith('s1');
  });

  it('should list all suppliers', async () => {
    const supplierProps = [{ id: 's1' }, { id: 's2' }];
    const suppliers = supplierProps.map((p) => ({ toPrimitives: () => p }));
    supplierRepository.findAll.mockResolvedValue(suppliers as any);

    const result = await service.listSuppliers();

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(supplierProps);
    expect(supplierRepository.findAll).toHaveBeenCalled();
  });
});
