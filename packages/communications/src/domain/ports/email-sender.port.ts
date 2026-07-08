/**
 * IEmailSender — Secondary (Driven) Port
 *
 * Defined by the Communications domain.
 * Implemented by the infrastructure adapter (e.g., ResendEmailSender).
 *
 * DIP: domain depends on this interface, NOT on the Resend SDK.
 */

/**
 * Email message payload for sending transactional emails.
 *
 * @example
 * ```ts
 * const msg: EmailMessage = {
 *   to: 'customer@example.com',
 *   subject: 'Order Confirmed',
 *   html: '<h1>Thanks!</h1>',
 * };
 * ```
 */
export interface EmailMessage {
  readonly to: string | string[];
  readonly from?: string;
  readonly subject: string;
  readonly html?: string;
  readonly text?: string;
  readonly replyTo?: string;
  readonly tags?: Record<string, string>;
}

/**
 * Result of an email send operation.
 *
 * @example
 * ```ts
 * const result: EmailResult = { id: 're_abc123', success: true };
 * ```
 */
export interface EmailResult {
  readonly id: string;
  readonly success: boolean;
  readonly error?: string;
}

/**
 * Port for sending transactional emails.
 *
 * @example
 * ```ts
 * class ResendEmailSender implements IEmailSender {
 *   async send(message: EmailMessage): Promise<EmailResult> { ... }
 *   async sendTemplate(templateId, to, variables): Promise<EmailResult> { ... }
 * }
 * ```
 */
export interface IEmailSender {
  /**
   * Sends a transactional email with the given message payload.
   *
   * @param message - The email to send.
   * @returns The provider ID and success status.
   *
   * @example
   * ```ts
   * const result = await emailSender.send({ to: 'a@b.com', subject: 'Hi', html: '<p>Hey</p>' });
   * if (result.success) console.log('Sent:', result.id);
   * ```
   */
  send(message: EmailMessage): Promise<EmailResult>;

  /**
   * Sends an email using a pre-defined template (e.g., Resend template or React Email).
   *
   * @param templateId - The template identifier in the provider.
   * @param to - Recipient email address.
   * @param variables - Template variable substitutions.
   *
   * @example
   * ```ts
   * await emailSender.sendTemplate('order-confirmed', 'a@b.com', { orderId: '123' });
   * ```
   */
  sendTemplate(
    templateId: string,
    to: string,
    variables: Record<string, unknown>,
  ): Promise<EmailResult>;
}

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
