/**
 * Carrier and tracking value objects for the Logistics bounded context.
 */

/**
 * Supported carrier codes for Chilean shipping providers.
 *
 * @example
 * ```ts
 * const carrier: CarrierCode = 'starken';
 * ```
 */
export type CarrierCode = 'starken' | 'blueexpress' | 'correos_chile' | 'chilexpress' | 'otro';

/**
 * Tracking status lifecycle for shipments.
 *
 * @example
 * ```ts
 * const status: TrackingStatus = 'in_transit';
 * ```
 */
export type TrackingStatus =
  | 'pending' // Waiting for supplier to dispatch
  | 'ready_to_ship' // Supplier prepared the package
  | 'in_transit' // Carrier picked up
  | 'out_for_delivery'
  | 'delivered'
  | 'failed' // Delivery failed
  | 'returned'; // Returned to sender

export interface TrackingEvent {
  readonly timestamp: string; // ISO 8601
  readonly location: string;
  readonly description: string;
  readonly status: TrackingStatus;
}

export interface TrackingInfo {
  readonly trackingNumber: string;
  readonly carrier: CarrierCode;
  readonly status: TrackingStatus;
  readonly estimatedDeliveryDate?: string; // ISO 8601 date
  readonly events: readonly TrackingEvent[];
}

/**
 * Check if a tracking number has a valid format for the given carrier.
 *
 * @example
 * ```ts
 * isValidTrackingNumber('1234567890', 'starken'); // true
 * ```
 */
export function isValidTrackingNumber(trackingNumber: string, carrier: CarrierCode): boolean {
  if (!trackingNumber || trackingNumber.trim().length < 5) {
    return false;
  }
  switch (carrier) {
    case 'starken':
      return /^\d{10,15}$/.test(trackingNumber);
    case 'blueexpress':
      return /^BE\d{8,12}$/.test(trackingNumber);
    case 'chilexpress':
      return /^[A-Z]{2}\d{8,12}[A-Z]{2}$/.test(trackingNumber);
    case 'correos_chile':
      return /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(trackingNumber);
    default:
      return trackingNumber.trim().length >= 5;
  }
}

/**
 * Check if a delivery is considered late (past estimated date).
 */
export function isDeliveryLate(info: TrackingInfo): boolean {
  if (!info.estimatedDeliveryDate) {
    return false;
  }
  if (info.status === 'delivered') {
    return false;
  }
  return new Date() > new Date(info.estimatedDeliveryDate);
}

/**
 * Get the latest tracking event, if any.
 */
export function getLatestEvent(info: TrackingInfo): TrackingEvent | undefined {
  if (info.events.length === 0) {
    return undefined;
  }
  return [...info.events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )[0];
}
