/**
 * Fulfillment Service — Facade for order fulfillment operations.
 *
 * @module @pranakaia/services/fulfillment
 */

import type { Result } from '@pranakaia/shared-kernel';
import { type FulfillmentConfig, resolveFulfillmentProvider } from './fulfillment.registry';
import type {
  FulfillmentAddress,
  FulfillmentLineItem,
  FulfillmentOrderResult,
  FulfillmentProvider,
} from './fulfillment.types';

export * from './bigbuy-fulfillment.provider';
export * from './fulfillment.registry';
export * from './fulfillment.types';

/**
 * FulfillmentService - High-level facade for order fulfillment
 */
export class FulfillmentService {
  private readonly provider: FulfillmentProvider;

  constructor(providerName: string = 'bigbuy', config?: FulfillmentConfig) {
    this.provider = resolveFulfillmentProvider(providerName, config);
  }

  async createOrder(
    orderId: string,
    lineItems: FulfillmentLineItem[],
    shippingAddress: FulfillmentAddress,
    notes?: string,
  ): Promise<Result<FulfillmentOrderResult, Error>> {
    return this.provider.createOrder({
      orderId,
      idempotencyKey: this.generateIdempotencyKey(orderId),
      lineItems,
      shippingAddress,
      notes,
    });
  }

  private generateIdempotencyKey(orderId: string): string {
    return `order_${orderId}_${Date.now()}`;
  }

  async getOrderStatus(providerOrderId: string): Promise<Result<FulfillmentOrderResult, Error>> {
    return this.provider.getOrderStatus(providerOrderId);
  }

  async cancelOrder(providerOrderId: string, reason?: string): Promise<Result<void, Error>> {
    return this.provider.cancelOrder(providerOrderId, reason);
  }
}
