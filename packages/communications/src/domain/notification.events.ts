/**
 * Notification Domain Events — Communications Bounded Context
 */

/**
 * Emitted when a notification is successfully delivered.
 *
 * @example
 * ```ts
 * const event: NotificationSent = {
 *   type: 'NotificationSent',
 *   channel: 'email',
 *   to: 'pablo@pranakaia.cl',
 *   templateId: 'order-confirmation',
 *   sentAt: new Date(),
 * };
 * ```
 */
export interface NotificationSent {
  readonly type: 'NotificationSent';
  readonly channel: 'email' | 'sms' | 'push';
  readonly to: string;
  readonly templateId: string;
  readonly sentAt: Date;
}

/**
 * Emitted when a notification delivery fails.
 *
 * @example
 * ```ts
 * const event: NotificationFailed = {
 *   type: 'NotificationFailed',
 *   channel: 'sms',
 *   to: '+56912345678',
 *   templateId: 'order-shipped',
 *   reason: 'Invalid phone number',
 *   failedAt: new Date(),
 * };
 * ```
 */
export interface NotificationFailed {
  readonly type: 'NotificationFailed';
  readonly channel: 'email' | 'sms' | 'push';
  readonly to: string;
  readonly templateId: string;
  readonly reason: string;
  readonly failedAt: Date;
}
