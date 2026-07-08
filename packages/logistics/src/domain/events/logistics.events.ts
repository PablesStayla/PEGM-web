import type { CarrierCode } from '../value-objects/tracking.vo';

/**
 * Emitted when a package is dispatched by the carrier.
 *
 * @example
 * ```ts
 * const event: PackageDispatched = {
 *   type: 'PackageDispatched',
 *   orderId: 'order_123',
 *   trackingNumber: 'STRK-123456',
 *   carrier: 'STARKEN',
 *   dispatchedAt: new Date(),
 * };
 * ```
 */
export interface PackageDispatched {
  readonly type: 'PackageDispatched';
  readonly orderId: string;
  readonly trackingNumber: string;
  readonly carrier: CarrierCode;
  readonly dispatchedAt: Date;
}

/**
 * Emitted when a package is successfully delivered.
 *
 * @example
 * ```ts
 * const event: PackageDelivered = {
 *   type: 'PackageDelivered',
 *   orderId: 'order_123',
 *   trackingNumber: 'STRK-123456',
 *   deliveredAt: new Date(),
 * };
 * ```
 */
export interface PackageDelivered {
  readonly type: 'PackageDelivered';
  readonly orderId: string;
  readonly trackingNumber: string;
  readonly deliveredAt: Date;
}

/**
 * Emitted when a package delivery fails.
 *
 * @example
 * ```ts
 * const event: PackageDeliveryFailed = {
 *   type: 'PackageDeliveryFailed',
 *   orderId: 'order_123',
 *   trackingNumber: 'STRK-123456',
 *   reason: 'Address not found',
 *   failedAt: new Date(),
 * };
 * ```
 */
export interface PackageDeliveryFailed {
  readonly type: 'PackageDeliveryFailed';
  readonly orderId: string;
  readonly trackingNumber: string;
  readonly reason: string;
  readonly failedAt: Date;
}
