import { createHmac } from 'node:crypto';
import type { PaymentGateway } from '@pranakaia/payments';
import { DomainError, Result } from '@pranakaia/shared-kernel';

export interface FlowGatewayConfig {
  apiKey: string;
  secretKey: string;
  sandbox: boolean;
  siteUrl: string;
}

/**
 * FlowPaymentGateway
 * Adapter for Flow payment gateway integration (Chile).
 */
export class FlowPaymentGateway implements PaymentGateway {
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;
  private readonly siteUrl: string;

  constructor(config: FlowGatewayConfig) {
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.baseUrl = config.sandbox ? 'https://sandbox.flow.cl/api' : 'https://www.flow.cl/api';
    this.siteUrl = config.siteUrl;
  }

  private sign(params: Record<string, string | number>): string {
    const message = Object.keys(params)
      .sort()
      .map((key) => `${key}${params[key]}`)
      .join('');
    return createHmac('sha256', this.secretKey).update(message).digest('hex');
  }

  async createSession(params: {
    orderId: string;
    email: string;
    amount: number;
    currency: string;
    items: Array<{ name: string; price: number; quantity: number; images: string[] }>;
    metadata?: Record<string, string>;
  }): Promise<Result<{ url: string; sessionId: string }, DomainError>> {
    try {
      const payload: Record<string, string | number> = {
        apiKey: this.apiKey,
        commerceOrder: params.orderId,
        subject: `Order #${params.orderId}`,
        amount: params.amount,
        currency: params.currency,
        email: params.email,
        urlConfirmation: `${this.siteUrl}/api/webhooks/flow`,
        urlReturn: `${this.siteUrl}/checkout/success`,
      };

      payload['s'] = this.sign(payload);

      const body = new URLSearchParams();
      for (const [key, value] of Object.entries(payload)) {
        body.append(key, String(value));
      }

      const response = await fetch(`${this.baseUrl}/payment/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        return Result.err(
          new DomainError(
            `Flow API responded with HTTP ${response.status} on /payment/create`,
            'GATEWAY_ERROR',
          ),
        );
      }

      const payment = (await response.json()) as { url: string; token: string };

      return Result.ok({
        url: `${payment.url}?token=${payment.token}`,
        sessionId: payment.token,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Flow payment session creation failed';
      return Result.err(new DomainError(message, 'GATEWAY_ERROR'));
    }
  }
}
