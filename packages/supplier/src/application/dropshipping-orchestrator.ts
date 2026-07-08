import type { IProductRepository } from '@pranakaia/catalog';
import type { OrderId } from '@pranakaia/checkout';
import { resolveFulfillmentProvider } from '@pranakaia/logistics';
import {
  type AuditLogEntry,
  type AuditWriter,
  DomainError,
  OrderIdHelper,
  ProductIdHelper,
  type SupplierId,
} from '@pranakaia/shared-kernel';
import type { IDropshipOrderRepository } from '../index';
import { buildProviderOrderInput, type PersistedOrder } from './dropshipping-orchestrator.helpers';

export type { PersistedOrder } from './dropshipping-orchestrator.helpers';

/**
 * DropshippingOrchestrator — The "Brain" of automated fulfillment.
 *
 * Responsible for:
 * 1. Orchestrating the fulfillment of a single paid order.
 * 2. Splitting the order into supplier-specific dropship orders.
 * 3. Communicating with external fulfillment providers (e.g. BigBuy).
 * 4. Persisting status changes and forensic audit logs.
 */
export class DropshippingOrchestrator {
  constructor(
    private readonly dropshipRepo: IDropshipOrderRepository,
    private readonly productRepo: IProductRepository,
    private readonly audit: AuditWriter,
  ) {}

  private async logAudit(entry: Omit<AuditLogEntry, 'severity' | 'entityType'>): Promise<void> {
    await this.audit({ ...entry, severity: 'info', entityType: 'dropship_order' });
  }

  /** Orchestrates the fulfillment of a single order by routing items to supplier providers. */
  async orchestrateOrder(order: unknown): Promise<void> {
    const o = order as PersistedOrder;
    const orderId = OrderIdHelper.from(o.id);

    await this.logAudit({
      action: 'DROPSHIPPING_ORCHESTRATION_STARTED',
      entityId: o.id,
      metadata: { orderNumber: o.orderNumber },
    });

    try {
      const itemsBySupplier = await this.groupItemsBySupplier(o.items);

      for (const [supplierId, items] of itemsBySupplier.entries()) {
        await this.fulfillForSupplier(o, orderId, supplierId, items);
      }
    } catch (error) {
      await this.handleCriticalFailure(o, error);
      throw error;
    }
  }

  private async groupItemsBySupplier(
    items: PersistedOrder['items'],
  ): Promise<Map<string, PersistedOrder['items']>> {
    const itemsBySupplier = new Map<string, PersistedOrder['items']>();

    for (const item of items) {
      const sId = await this.resolveSupplierId(item.productId);
      const list = itemsBySupplier.get(sId) || [];
      list.push(item);
      itemsBySupplier.set(sId, list);
    }

    return itemsBySupplier;
  }

  private async resolveSupplierId(productId: string): Promise<string> {
    const productResult = await this.productRepo.findById(ProductIdHelper.from(productId));
    if (!productResult.success) {
      throw productResult.error ?? new DomainError(`Product not found: ${productId}`, 'NOT_FOUND');
    }

    const product = productResult.value;
    if (!product) {
      throw new DomainError(`Product not found: ${productId}`, 'NOT_FOUND');
    }

    return product.supplierId || 'MANUAL_REQUIRED';
  }

  private async fulfillForSupplier(
    o: PersistedOrder,
    orderId: OrderId,
    supplierId: string,
    items: PersistedOrder['items'],
  ): Promise<void> {
    if (supplierId === 'MANUAL_REQUIRED') {
      return this.logManualRequired(o.id, items);
    }

    try {
      const provider = resolveFulfillmentProvider(supplierId.toLowerCase());
      const result = await provider.createOrder(buildProviderOrderInput(o, supplierId, items));

      if (!result.success) {
        throw result.error;
      }

      const data = result.value;
      if (!data) {
        throw new Error('Provider returned empty result');
      }

      await this.dropshipRepo.updateStatus(orderId, 'SENT_TO_SUPPLIER', {
        supplierId: supplierId as SupplierId,
        supplierOrderId: data.providerOrderId,
        updatedAt: new Date(),
      });

      await this.logAudit({
        action: 'DROPSHIPPING_SUBMITTED_SUCCESSFULLY',
        entityId: o.id,
        metadata: { supplierId, providerOrderId: data.providerOrderId },
      });
    } catch (error) {
      await this.handleSubmissionFailure(o.id, orderId, supplierId, error);
    }
  }

  private async logManualRequired(orderId: string, items: PersistedOrder['items']): Promise<void> {
    await this.logAudit({
      action: 'DROPSHIPPING_SKIPPED_MANUAL_REQUIRED',
      entityId: orderId,
      metadata: { items: items.map((i) => i.sku) },
    });
  }

  private async handleSubmissionFailure(
    orderIdStr: string,
    orderId: OrderId,
    supplierId: string,
    error: unknown,
  ): Promise<void> {
    const errorMsg = error instanceof Error ? error.message : String(error);

    await this.logAudit({
      action: 'DROPSHIPPING_SUBMISSION_FAILED',
      entityId: orderIdStr,
      metadata: { supplierId, error: errorMsg },
    });

    await this.dropshipRepo.updateStatus(orderId, 'RETRY_PENDING', { updatedAt: new Date() });
  }

  private async handleCriticalFailure(o: PersistedOrder, error: unknown): Promise<void> {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await this.logAudit({
      action: 'DROPSHIPPING_ORCHESTRATION_CRITICAL_FAILURE',
      entityId: o.id,
      metadata: { error: errorMsg },
    });
  }
}
