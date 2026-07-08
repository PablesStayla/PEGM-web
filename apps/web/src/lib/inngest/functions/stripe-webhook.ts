import { inngest } from '../client';

export const stripeWebhookReceived = inngest.createFunction(
  {
    id: 'stripe-webhook-received',
    name: 'Stripe Webhook Handler',
    retries: 5,
  },
  { event: 'stripe/webhook.received' },
  async ({ event, step }) => {
    // Dynamic import to load domain logic only when executed
    const { handlePaymentCompletion } = await import('@/app/actions/checkout');

    await step.run('process-stripe-webhook', async () => {
      // event.data contains the entire StripeWebhookEvent payload
      await handlePaymentCompletion(event.data);
    });

    return { success: true, stripeEventId: event.data.id };
  },
);
