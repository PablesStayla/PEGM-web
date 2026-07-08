import type { PaymentGateway } from '@pranakaia/payments';
import { DomainError, Result } from '@pranakaia/shared-kernel';
import Stripe from 'stripe';

export interface StripeGatewayConfig {
  secretKey: string;
  siteUrl: string;
}

/**
 * StripePaymentGateway
 * Adapter for Stripe payment gateway integration (International).
 */
export class StripePaymentGateway implements PaymentGateway {
  private readonly stripe: Stripe;
  private readonly siteUrl: string;

  constructor(config: StripeGatewayConfig) {
    if (!config.secretKey) {
      throw new Error('secretKey is required for StripePaymentGateway');
    }

    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2025-02-24.acacia' as '2025-02-24.acacia',
    });
    this.siteUrl = config.siteUrl;
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
      const currency = params.currency.toLowerCase();
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.items.map((item) =>
        this.mapToStripeLineItem(item, currency),
      );

      const session = await this.stripe.checkout.sessions.create(
        {
          payment_method_types: ['card'],
          line_items: lineItems,
          mode: 'payment',
          success_url: `${this.siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${this.siteUrl}/checkout/cancel`,
          customer_email: params.email,
          client_reference_id: params.orderId,
          metadata: {
            ...params.metadata,
            orderId: params.orderId,
          },
        },
        {
          idempotencyKey: `checkout:${params.orderId}`,
        },
      );

      if (!session.url) {
        return Result.err(new DomainError('Stripe session created without URL', 'GATEWAY_ERROR'));
      }

      return Result.ok({
        url: session.url,
        sessionId: session.id,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Stripe payment session creation failed';
      return Result.err(new DomainError(message, 'GATEWAY_ERROR'));
    }
  }

  private mapToStripeLineItem(
    item: { name: string; price: number; quantity: number; images: string[] },
    currency: string,
  ): Stripe.Checkout.SessionCreateParams.LineItem {
    const isZeroDecimal = currency === 'clp' || currency === 'jpy';
    const unitAmount = isZeroDecimal ? Math.round(item.price) : Math.round(item.price * 100);

    const product_data: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData = {
      name: item.name,
    };

    if (item.images && item.images.length > 0) {
      product_data.images = item.images;
    }

    return {
      price_data: {
        currency,
        product_data,
        unit_amount: unitAmount,
      },
      quantity: item.quantity,
    };
  }
}
