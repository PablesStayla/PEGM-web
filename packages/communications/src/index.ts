/**
 * @pranakaia/communications — Communications Bounded Context
 *
 * Pure domain: ports (IEmailSender, ISmsSender), value objects (Email address,
 * notification), use cases (SendOrderConfirmation, etc).
 *
 * Screaming Architecture: domain/ → application/ → infrastructure/
 */

export type { SendNotificationCommand } from './application/send-notification.use-case';
// ── Application ───────────────────────────────────────────────────────────
export { SendNotificationUseCase } from './application/send-notification.use-case';
// ── Domain ────────────────────────────────────────────────────────────────
// Value Objects
export type { EmailTemplate, EmailTemplateId } from './domain/email-template.vo';
// Domain Events
export type { NotificationFailed, NotificationSent } from './domain/notification.events';
export type { Notification, NotificationType } from './domain/notification.vo';
// Ports (driven / secondary)
export type { EmailMessage, EmailResult, IEmailSender } from './domain/ports/email-sender.port';
export type { INotificationSender } from './domain/ports/notification-sender.port';
