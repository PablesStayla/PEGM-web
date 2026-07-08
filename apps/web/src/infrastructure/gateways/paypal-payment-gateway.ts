import type { PaymentGateway } from '@pranakaia/payments';
import { DomainError, Result } from '@pranakaia/shared-kernel';
import { env } from '@/lib/env';
import { createLogger } from '@/lib/logger';
import { getSiteUrl } from '@/lib/site-url';

const log = createLogger({ module: 'gateway:paypal' });

export class PayPalPaymentGateway implements PaymentGateway {
  private clientId: string;
  private clientSecret: string;
  private sandbox: boolean;

  constructor() {
    this.clientId = env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = env.PAYPAL_CLIENT_SECRET || '';
    this.sandbox = env.PAYPAL_MODE !== 'live';

    if (!this.clientId || !this.clientSecret) {
      // No lanzamos error aquí para permitir inicialización parcial,
      // pero resolvePaymentGateway fallará si se intenta usar sin credenciales.
      log.warn('PayPal credentials not fully configured');
    }
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const url = this.sandbox
      ? 'https://api-m.sandbox.paypal.com/v1/oauth2/token'
      : 'https://api-m.paypal.com/v1/oauth2/token';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`[PayPalPaymentGateway] Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
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
      if (!this.clientId || !this.clientSecret) {
        return Result.err(
          new DomainError('PayPal credentials are missing', 'PAYMENT_SESSION_FAILED'),
        );
      }

      const accessToken = await this.getAccessToken();
      const url = this.sandbox
        ? 'https://api-m.sandbox.paypal.com/v2/checkout/orders'
        : 'https://api-m.paypal.com/v2/checkout/orders';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: params.orderId,
              amount: {
                currency_code: params.currency.toUpperCase(),
                value: (params.amount / 100).toFixed(2), // Convert cents to decimal
              },
              description: `Order #${params.orderId}`,
              custom_id: params.orderId,
            },
          ],
          application_context: {
            return_url: `${getSiteUrl()}/checkout/success?gateway=paypal`,
            cancel_url: `${getSiteUrl()}/checkout/cancel`,
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return Result.err(
          new DomainError(
            `[PayPalPaymentGateway] Failed to create order: ${JSON.stringify(error)}`,
            'PAYMENT_SESSION_FAILED',
          ),
        );
      }

      const order = await response.json();
      const approveUrl = order.links.find(
        (l: { rel: string; href: string }) => l.rel === 'approve',
      )?.href;

      if (!approveUrl) {
        return Result.err(
          new DomainError(
            'Failed to find approval URL in PayPal response',
            'PAYMENT_SESSION_FAILED',
          ),
        );
      }

      return Result.ok({
        url: approveUrl,
        sessionId: order.id,
      });
    } catch (error) {
      log.error('PayPal Session Error', {
        error: error instanceof Error ? error.message : String(error),
      });
      return Result.err(
        new DomainError('Failed to create payment session with PayPal', 'PAYMENT_SESSION_FAILED'),
      );
    }
  }
}
