import type { PaymentGateway } from '@pranakaia/payments';
import { DomainError, Result } from '@pranakaia/shared-kernel';
import { createFlowPayment } from '@/lib/flow/client';
import { getSiteUrl } from '@/lib/site-url';

export class FlowPaymentGateway implements PaymentGateway {
  async createSession(params: {
    orderId: string;
    email: string;
    amount: number;
    currency: string;
    items: Array<{ name: string; price: number; quantity: number; images: string[] }>;
    metadata?: Record<string, string>;
  }): Promise<Result<{ url: string; sessionId: string }, DomainError>> {
    try {
      const siteUrl = getSiteUrl();

      const payment = await createFlowPayment({
        commerceOrder: params.orderId,
        subject: `Order #${params.orderId}`,
        amount: params.amount,
        currency: params.currency,
        email: params.email,
        urlConfirmation: `${siteUrl}/api/webhooks/flow`,
        urlReturn: `${siteUrl}/checkout/success`,
      });

      return Result.ok({
        url: `${payment.url}?token=${payment.token}`,
        sessionId: payment.token,
      });
    } catch (error) {
      return Result.err(
        new DomainError(
          error instanceof Error ? error.message : String(error),
          'PAYMENT_SESSION_FAILED',
        ),
      );
    }
  }
}
