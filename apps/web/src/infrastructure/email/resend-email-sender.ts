import type { DropshipOrderProps, INotificationService } from '@pranakaia/supplier';
import { observabilityLogger } from '@/lib/logger';

/**
 * Local type for email order details — not exported from any domain package.
 */
export interface EmailOrderDetails {
  orderNumber: string;
  total: number;
  customer: { firstName: string; email: string };
  items: Array<{ name: string; quantity: number; price: number }>;
}

/**
 * Local port interface for sending emails — not exported from any domain package.
 */
export interface EmailSender {
  sendOrderConfirmation(order: EmailOrderDetails): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
}

export class ResendEmailSender implements EmailSender, INotificationService {
  async sendOrderConfirmation(_order: EmailOrderDetails): Promise<void> {
    // ... (implementación existente)
  }

  async sendWelcomeEmail(_email: string, _name: string): Promise<void> {
    // ... (implementación existente)
  }

  // INotificationService Implementation
  async notifyNewDropshipOrder(order: DropshipOrderProps): Promise<void> {
    observabilityLogger.info('Notifying admin of new dropship order', {
      dropshipOrderId: order.id,
    });
    // En el futuro, enviar email al administrador o loguear en sistema de alertas
  }

  async notifyDropshipOrderShipped(order: DropshipOrderProps): Promise<void> {
    observabilityLogger.info('Notifying customer of shipment', {
      orderId: order.orderId,
      tracking: order.trackingNumber,
    });

    // Aquí se enviaría el email al cliente con el tracking
    // await sendEmail({ ... });
  }

  async notifyDropshipOrderFailed(order: DropshipOrderProps): Promise<void> {
    observabilityLogger.error('Alert: Dropship order failed', {
      dropshipOrderId: order.id,
      errors: order.errors,
    });
  }
}
