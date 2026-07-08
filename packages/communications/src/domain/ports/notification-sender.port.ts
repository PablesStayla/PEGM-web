/**
 * INotificationSender — Secondary (Driven) Port
 *
 * Generic notification channel abstraction (email, SMS, push).
 */

/** Supported notification channels. */
export type NotificationChannel = 'email' | 'sms' | 'push';

/**
 * Port for sending notifications across multiple channels.
 *
 * @example
 * ```ts
 * class MultiChannelSender implements INotificationSender {
 *   async send(channel, to, payload) { ... }
 * }
 * ```
 */
export interface INotificationSender {
  /**
   * Sends a notification through the specified channel.
   *
   * @param channel - The delivery channel (email, sms, push).
   * @param to - The recipient identifier (email, phone, device token).
   * @param payload - Channel-specific message data.
   *
   * @example
   * ```ts
   * await sender.send('sms', '+56912345678', { message: 'Your order is shipped!' });
   * ```
   */
  send(channel: NotificationChannel, to: string, payload: Record<string, unknown>): Promise<void>;
}
