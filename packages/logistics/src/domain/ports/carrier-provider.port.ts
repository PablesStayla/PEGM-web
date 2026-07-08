import type { TrackingInfo } from '../value-objects/tracking.vo';

/**
 * Port for carrier tracking integrations (Starken, BlueExpress, etc.).
 *
 * @example
 * ```ts
 * class StarkenCarrierProvider implements ICarrierProvider {
 *   async getTracking(trackingNumber: string): Promise<TrackingInfo> { ... }
 * }
 * ```
 */
export interface ICarrierProvider {
  /**
   * Fetches tracking information for a shipment.
   *
   * @param trackingNumber - The carrier's tracking number.
   * @returns Current tracking status and event history.
   *
   * @example
   * ```ts
   * const info = await carrierProvider.getTracking('STRK-123456');
   * console.log(info.status); // 'IN_TRANSIT'
   * ```
   */
  getTracking(trackingNumber: string): Promise<TrackingInfo>;
}
