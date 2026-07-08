import { createHmac, timingSafeEqual } from 'node:crypto';
import { db, products, stores } from '@pranakaia/infrastructure/db';
import { Result } from '@pranakaia/shared-kernel';
import { eq } from 'drizzle-orm';
import { container } from '@/providers/container';
import { logger } from '../../../lib/logger';
import { decryptSupplierSecret } from '../../../lib/security/supplier-secrets';

export interface WebhookPayload {
  event: 'stock.updated' | 'order.shipped';
  data: any;
  timestamp: string;
}

export class SupplierWebhookService {
  /**
   * Processes an incoming webhook from a supplier.
   */
  async handleWebhook(
    supplierId: string,
    payload: WebhookPayload,
    signature: string,
  ): Promise<Result<void, Error>> {
    try {
      // 1. Get supplier to get API Key for signature verification
      const { settings } = await this.getStoreSettings();
      const supplier = this.findSupplier(settings, supplierId);

      if (!supplier) {
        return Result.err(new Error('Supplier not found'));
      }

      // 2. Verify signature
      const isValid = this.verifySignature(
        payload,
        signature,
        decryptSupplierSecret(supplier.apiKey),
      );
      if (!isValid) {
        return Result.err(new Error('Invalid signature'));
      }

      // 3. Dispatch event
      switch (payload.event) {
        case 'stock.updated':
          await this.handleStockUpdate(supplierId, payload.data);
          break;
        case 'order.shipped':
          await this.handleOrderShipped(supplierId, payload.data);
          break;
        default:
          logger.warn('Unknown supplier webhook event', { event: payload.event, supplierId });
      }

      return Result.ok(undefined);
    } catch (error) {
      logger.error('SupplierWebhookService.handleWebhook error', { supplierId, error });
      return Result.err(error instanceof Error ? error : new Error('Failed to handle webhook'));
    }
  }

  private verifySignature(payload: any, signature: string, secret: string): boolean {
    if (!signature || !secret) {
      return false;
    }
    const body = JSON.stringify(payload);
    const expectedSignature = createHmac('sha256', secret).update(body).digest('hex');

    try {
      return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch {
      return false;
    }
  }

  private async handleStockUpdate(_supplierId: string, data: { sku: string; quantity: number }) {
    // 1. Find product ID from SKU in database
    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.sku, data.sku))
      .limit(1);

    if (!product) {
      logger.error('Product not found for SKU in stock update webhook', { sku: data.sku });
      return;
    }

    // 2. Delegate to InventoryService
    await container.inventoryService.bulkUpdateStock(
      [{ productId: product.id, quantity: data.quantity }],
      'system', // Webhook update
    );
  }

  private async handleOrderShipped(
    _supplierId: string,
    data: { orderNumber: string; trackingNumber: string; trackingUrl?: string },
  ) {
    // Find order and update status with exactOptionalPropertyTypes compliance
    const result = await container.orderService.updateOrderStatus({
      orderId: data.orderNumber,
      status: 'SHIPPED',
      adminId: 'system',
      ...(data.trackingNumber ? { trackingNumber: data.trackingNumber } : {}),
      ...(data.trackingUrl ? { trackingUrl: data.trackingUrl } : {}),
    });

    if (!result.success) {
      logger.error('Failed to update order status from webhook', { data, error: result.error });
    }
  }

  private async getStoreSettings() {
    const [store] = await db.select({ settings: stores.settings }).from(stores).limit(1);
    return store || { settings: {} };
  }

  private findSupplier(settings: any, id: string) {
    const suppliers = settings.suppliers || [];
    return suppliers.find((s: any) => s.id === id);
  }
}
