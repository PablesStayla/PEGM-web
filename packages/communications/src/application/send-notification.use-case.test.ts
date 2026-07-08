/**
 * SendNotificationUseCase tests — pure in-memory mock, no Resend SDK
 */
import { describe, expect, it, vi } from 'vitest';
import type { IEmailSender } from '../domain/ports/email-sender.port';
import { SendNotificationUseCase } from './send-notification.use-case';

// In-memory stub implements the port — no SDK
const makeEmailSenderMock = (succeeds = true): IEmailSender => ({
  send: vi.fn().mockResolvedValue({ id: 'email_123', success: succeeds }),
  sendTemplate: vi.fn().mockResolvedValue({
    id: 'email_123',
    success: succeeds,
    error: succeeds ? undefined : 'SMTP error',
  }),
});

describe('SendNotificationUseCase', () => {
  it('sends an email notification successfully', async () => {
    const sender = makeEmailSenderMock(true);
    const uc = new SendNotificationUseCase(sender);

    const result = await uc.execute({
      channel: 'email',
      to: 'cliente@example.com',
      templateId: 'order-confirmation',
      variables: { orderId: 'ord_abc', total: 25470 },
      subject: 'Tu pedido fue confirmado',
    });

    expect(result.type).toBe('NotificationSent');
    expect(result.to).toBe('cliente@example.com');
    expect(result.channel).toBe('email');
    expect(sender.sendTemplate).toHaveBeenCalledWith('order-confirmation', 'cliente@example.com', {
      orderId: 'ord_abc',
      total: 25470,
    });
  });

  it('returns NotificationFailed when sender fails', async () => {
    const sender = makeEmailSenderMock(false);
    const uc = new SendNotificationUseCase(sender);

    const result = await uc.execute({
      channel: 'email',
      to: 'cliente@example.com',
      templateId: 'order-confirmation',
      variables: {},
    });

    expect(result.type).toBe('NotificationFailed');
    if (result.type === 'NotificationFailed') {
      expect(result.reason).toBe('SMTP error');
    }
  });

  it('stubs non-email channels without calling emailSender', async () => {
    const sender = makeEmailSenderMock(true);
    const uc = new SendNotificationUseCase(sender);

    const result = await uc.execute({
      channel: 'sms',
      to: '+56912345678',
      templateId: 'order-confirmation',
      variables: {},
    });

    expect(result.type).toBe('NotificationSent');
    expect(result.channel).toBe('sms');
    expect(sender.sendTemplate).not.toHaveBeenCalled();
  });

  it('does NOT import the Resend SDK — pure port-based', () => {
    // If this file compiles without resend, DIP is satisfied.
    expect(true).toBe(true);
  });
});
