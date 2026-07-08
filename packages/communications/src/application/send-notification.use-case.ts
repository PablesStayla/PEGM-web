/**
 * SendNotificationUseCase — Communications Application Layer
 *
 * Orchestrates sending a notification via the IEmailSender port.
 * No SDK references — pure application logic.
 */

import type { NotificationFailed, NotificationSent } from '../domain/notification.events';
import type { IEmailSender } from '../domain/ports/email-sender.port';

export interface SendNotificationCommand {
  readonly channel: 'email' | 'sms' | 'push';
  readonly to: string;
  readonly templateId: string;
  readonly variables: Record<string, unknown>;
  readonly subject?: string;
  readonly html?: string;
}

export class SendNotificationUseCase {
  constructor(private readonly emailSender: IEmailSender) {}

  async execute(command: SendNotificationCommand): Promise<NotificationSent | NotificationFailed> {
    if (command.channel !== 'email') {
      // Stub for SMS/push — extend with ISmsSender port when needed
      return {
        type: 'NotificationSent',
        channel: command.channel,
        to: command.to,
        templateId: command.templateId,
        sentAt: new Date(),
      };
    }

    const result = await this.emailSender.sendTemplate(
      command.templateId,
      command.to,
      command.variables,
    );

    if (result.success) {
      return {
        type: 'NotificationSent',
        channel: 'email',
        to: command.to,
        templateId: command.templateId,
        sentAt: new Date(),
      };
    }

    return {
      type: 'NotificationFailed',
      channel: 'email',
      to: command.to,
      templateId: command.templateId,
      reason: result.error ?? 'Unknown error',
      failedAt: new Date(),
    };
  }
}
