import type { SupplierId } from '@pranakaia/shared-kernel';
import { type ISupplierRepository, Result, Supplier, type SupplierProps } from '../index';

export class SupplierService {
  constructor(private readonly supplierRepository: ISupplierRepository) {}

  async createSupplier(
    dto: Omit<SupplierProps, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>,
  ): Promise<Result<SupplierProps, Error>> {
    const supplierResult = Supplier.create(dto);

    if (supplierResult.isFailure) {
      return Result.err(supplierResult.errorValue);
    }

    const supplier = supplierResult.getValue();
    await this.supplierRepository.save(supplier);

    return Result.ok(supplier.toPrimitives());
  }

  async getSupplier(id: string): Promise<Result<SupplierProps | null, Error>> {
    try {
      const supplier = await this.supplierRepository.findById(id as SupplierId);
      return Result.ok(supplier ? supplier.toPrimitives() : null);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to get supplier'));
    }
  }

  async listSuppliers(): Promise<Result<SupplierProps[], Error>> {
    try {
      const suppliers = await this.supplierRepository.findAll();
      return Result.ok(suppliers.map((s) => s.toPrimitives()));
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to list suppliers'));
    }
  }
}
