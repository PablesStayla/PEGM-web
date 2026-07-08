import type { IInventorySource, ISupplierRepository } from '../index';

export interface InventorySyncResult {
  supplierId: string;
  supplierName: string;
  productsChecked: number;
  productsUpdated: number;
  productsFailed: number;
  errors: string[];
}

export interface IInventorySyncLogger {
  logSync(result: InventorySyncResult & { syncType: string; status: string }): Promise<void>;
}

export interface ISupplierProductUpdater {
  updateStock(supplierId: string, externalProductId: string, stockLevel: number): Promise<boolean>;
  getSupplierProductCount(supplierId: string): Promise<number>;
}

export class InventorySyncService {
  constructor(
    private readonly supplierRepo: ISupplierRepository,
    private readonly inventorySource: IInventorySource,
    private readonly productUpdater: ISupplierProductUpdater,
    private readonly syncLogger?: IInventorySyncLogger,
  ) {}

  async syncSupplier(supplierId: string): Promise<InventorySyncResult> {
    const supplier = await this.supplierRepo.findById(supplierId);
    if (!supplier) {
      throw new Error(`Supplier ${supplierId} not found`);
    }

    const result = this.createEmptyResult(supplier.id, supplier.name);

    try {
      const externalItems = await this.inventorySource.fetchStock(supplier);
      result.productsChecked = externalItems.length;

      await this.processExternalItems(supplier.id, externalItems, result);
    } catch (err) {
      result.errors.push(
        `Failed to fetch stock from ${supplier.name}: ${this.getErrorMessage(err)}`,
      );
    }

    // Log sync result
    if (this.syncLogger) {
      await this.syncLogger.logSync({
        ...result,
        syncType: 'INCREMENTAL',
        status: this.getSyncStatus(result),
      });
    }

    return result;
  }

  private createEmptyResult(supplierId: string, supplierName: string): InventorySyncResult {
    return {
      supplierId,
      supplierName,
      productsChecked: 0,
      productsUpdated: 0,
      productsFailed: 0,
      errors: [],
    };
  }

  private async processExternalItems(
    supplierId: string,
    externalItems: Array<{ externalProductId: string; stockLevel: number }>,
    result: InventorySyncResult,
  ): Promise<void> {
    for (const item of externalItems) {
      try {
        const updated = await this.productUpdater.updateStock(
          supplierId,
          item.externalProductId,
          item.stockLevel,
        );

        if (updated) {
          result.productsUpdated++;
        }
      } catch (err) {
        result.productsFailed++;
        result.errors.push(
          `Failed to update ${item.externalProductId}: ${this.getErrorMessage(err)}`,
        );
      }
    }
  }

  private getSyncStatus(result: InventorySyncResult): string {
    if (result.errors.length === 0) {
      return 'COMPLETED';
    }

    if (result.productsFailed === result.productsChecked) {
      return 'FAILED';
    }

    return 'PARTIAL';
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  async syncAll(): Promise<{
    results: InventorySyncResult[];
    totalSynced: number;
    totalErrors: number;
  }> {
    const suppliers = await this.supplierRepo.findAll();
    const activeSuppliers = suppliers.filter((s) => s.isActive);

    const results: InventorySyncResult[] = [];
    let totalSynced = 0;
    let totalErrors = 0;

    for (const supplier of activeSuppliers) {
      const syncRes = await this.syncSingleSupplierInBulk(supplier);
      results.push(syncRes.result);
      totalSynced += syncRes.result.productsUpdated;
      totalErrors += syncRes.result.productsFailed + syncRes.errorCount;
    }

    return { results, totalSynced, totalErrors };
  }

  private async syncSingleSupplierInBulk(supplier: {
    id: string;
    name: string;
  }): Promise<{ result: InventorySyncResult; errorCount: number }> {
    try {
      const result = await this.syncSupplier(supplier.id);
      return { result, errorCount: 0 };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        result: {
          supplierId: supplier.id,
          supplierName: supplier.name,
          productsChecked: 0,
          productsUpdated: 0,
          productsFailed: 0,
          errors: [errorMessage],
        },
        errorCount: 1,
      };
    }
  }
}
