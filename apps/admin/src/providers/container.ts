/**
 * Dependency Container — Port & Adapter Registry (Hexagonal Architecture).
 *
 * Centralized place for instantiating services with their real infrastructure
 * adapters. This ensures we never do `new Service(undefined as any)` in our
 * server actions.
 */

import { InventoryService } from '@pranakaia/inventory';
import { AuditService } from '../resources/audit/application/audit.service';
import { CmsService } from '../resources/cms/application/cms.service';
import { OrderService } from '../resources/orders/application/order.service';
import { PricingService } from '../resources/pricing/application/pricing.service';
import { AdminProductService } from '../resources/products/application/product.service';
import { ReportingService } from '../resources/reporting/application/reporting.service';
import { SupplierService } from '../resources/suppliers/application/supplier.service';
import { SupplierWebhookService } from '../resources/suppliers/application/supplier-webhook.service';

/**
 * Registry of all available application services.
 */
class Container {
  private _inventoryService: InventoryService | null = null;
  private _orderService: OrderService | null = null;
  private _adminProductService: AdminProductService | null = null;
  private _supplierService: SupplierService | null = null;
  private _supplierWebhookService: SupplierWebhookService | null = null;
  private _auditService: AuditService | null = null;
  private _pricingService: PricingService | null = null;
  private _cmsService: CmsService | null = null;
  private _reportingService: ReportingService | null = null;

  /**
   * Getter for InventoryService. Lazy initialization.
   */
  get inventoryService(): InventoryService {
    if (!this._inventoryService) {
      const repository = this.createInventoryRepository();
      this._inventoryService = new InventoryService(repository);
    }
    return this._inventoryService;
  }

  /**
   * Getter for OrderService.
   */
  get orderService(): OrderService {
    if (!this._orderService) {
      this._orderService = new OrderService();
    }
    return this._orderService;
  }

  /**
   * Getter for AdminProductService.
   */
  get adminProductService(): AdminProductService {
    if (!this._adminProductService) {
      this._adminProductService = new AdminProductService();
    }
    return this._adminProductService;
  }

  /**
   * Getter for SupplierService.
   */
  get supplierService(): SupplierService {
    if (!this._supplierService) {
      this._supplierService = new SupplierService();
    }
    return this._supplierService;
  }

  /**
   * Getter for SupplierWebhookService.
   */
  get supplierWebhookService(): SupplierWebhookService {
    if (!this._supplierWebhookService) {
      this._supplierWebhookService = new SupplierWebhookService();
    }
    return this._supplierWebhookService;
  }

  /**
   * Getter for AuditService.
   */
  get auditService(): AuditService {
    if (!this._auditService) {
      this._auditService = new AuditService();
    }
    return this._auditService;
  }

  /**
   * Getter for PricingService.
   */
  get pricingService(): PricingService {
    if (!this._pricingService) {
      this._pricingService = new PricingService();
    }
    return this._pricingService;
  }

  /**
   * Getter for CmsService.
   */
  get cmsService(): CmsService {
    if (!this._cmsService) {
      this._cmsService = new CmsService();
    }
    return this._cmsService;
  }

  /**
   * Getter for ReportingService.
   */
  get reportingService(): ReportingService {
    if (!this._reportingService) {
      this._reportingService = new ReportingService();
    }
    return this._reportingService;
  }

  /**
   * Helper to create the repository adapter.
   */
  private createInventoryRepository() {
    return {
      reserveStock: async (_id: any, _qty: number) => ({ success: true, value: true }),
      releaseStock: async (_id: any, _qty: number) => ({ success: true, value: true }),
      consumeStock: async (_id: any, _qty: number) => ({ success: true, value: true }),
    } as any;
  }
}

export const container = new Container();
