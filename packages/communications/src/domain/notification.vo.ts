/**
 * Notification Value Object — Communications Bounded Context
 */

/** Supported notification delivery channels. */
export type NotificationType = 'email' | 'sms' | 'push';

/**
 * A notification to be sent through a specific channel.
 *
 * @example
 * ```ts
 * const notification: Notification = {
 *   type: 'email',
 *   to: 'pablo@pranakaia.cl',
 *   templateId: 'order-confirmation',
 *   variables: { orderNumber: 'ORD-001' },
 * };
 * ```
 */
export interface Notification {
  readonly type: NotificationType;
  readonly to: string;
  readonly templateId: string;
  readonly variables: Record<string, unknown>;
  readonly sentAt?: Date;
  readonly success?: boolean;
  readonly errorMessage?: string;
}
