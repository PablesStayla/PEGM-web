import type { DropshipOrder } from '../entities';

/**
 * Port for supplier gateway integrations (AliExpress API, etc.).
 *
 * @example
 * ```ts
 * class AliExpressGateway implements ISupplierGateway {
 *   async submitOrder(order) { ... }
 *   async getOrderStatus(externalOrderId) { ... }
 * }
 * ```
 */
export interface ISupplierGateway {
  /**
   * Submits a dropship order to the external supplier.
   *
   * @param order - The dropship order to submit.
   * @returns The supplier's external order ID and initial status.
   *
   * @example
   * ```ts
   * const result = await gateway.submitOrder(order);
   * console.log(result.externalOrderId); // 'ALI-789'
   * ```
   */
  submitOrder(order: DropshipOrder): Promise<{
    externalOrderId: string;
    status: string;
  }>;

  /**
   * Queries the order status from the external supplier.
   *
   * @param externalOrderId - The supplier's order identifier.
   * @returns Current status and optional tracking info.
   *
   * @example
   * ```ts
   * const status = await gateway.getOrderStatus('ALI-789');
   * if (status.trackingNumber) { /* shipment dispatched *\/ }
   * ```
   */
  getOrderStatus(externalOrderId: string): Promise<{
    status: string;
    trackingNumber?: string;
    carrier?: string;
  }>;
}
