import { db, orders } from '@pranakaia/infrastructure/db';
import { OrderConfirmationEmail, sendEmail } from '@pranakaia/infrastructure/email';
import { eq } from 'drizzle-orm';
import { NotificationService } from '../../services/notification-service';
import { inngest } from '../client';

/**
 * ADR-016: Background Jobs — Order Fulfillment
 *
 * Triggered by `order/created` event. Responsible for:
 * 1. Marking the order as PROCESSING
 * 2. Sending a fulfillment notification email via the email package
 * 3. Notifying Discord (Senior Grade Monitoring)
 *
 * Retries automatically up to 3 times with exponential backoff on failure.
 */
export const fulfillOrder = inngest.createFunction(
  {
    id: 'fulfill-order',
    name: 'Fulfill Order',
    retries: 3,
  },
  { event: 'order/created' },
  async ({
    event,
    step,
  }: {
    event: {
      data: {
        orderId: string;
        orderNumber: string;
        customerEmail: string;
        customerFirstName: string;
        orderTotal: number;
        items: Array<{ name: string; quantity: number; price: number }>;
      };
    };
    step: { run: <T>(id: string, fn: () => Promise<T>) => Promise<T> };
  }) => {
    const { orderId, orderNumber, customerEmail, customerFirstName, orderTotal, items } =
      event.data;

    // Step 1 — Mark order as PROCESSING (idempotent: safe to retry)
    await step.run('mark-order-processing', async () => {
      await db
        .update(orders)
        .set({ status: 'PROCESSING', updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    });

    // Step 2 — Send order confirmation email
    await step.run('send-confirmation-email', async () => {
      const emailContent = OrderConfirmationEmail({ orderNumber });
      await sendEmail({
        to: customerEmail,
        subject: `Tu pedido #${orderNumber} ha sido confirmado — PranaKaia`,
        body: `Tu pedido #${orderNumber} ha sido confirmado.`,
        html: emailContent.html,
      });
    });

    // Step 3 — Senior Grade: Discord Notification
    await step.run('notify-discord-sales', async () => {
      await NotificationService.notifyOrderCreated({
        orderNumber,
        customerName: customerFirstName,
        amount: orderTotal,
        itemsCount: items.reduce((acc, item) => acc + item.quantity, 0),
      });
    });

    return { orderId, status: 'processing' };
  },
);
