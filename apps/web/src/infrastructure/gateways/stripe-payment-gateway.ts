import type { PaymentGateway } from '@pranakaia/payments';
import { DomainError, Result } from '@pranakaia/shared-kernel';
import Stripe from 'stripe';
import { env } from '@/lib/env';
import { createLogger } from '@/lib/logger';
import { getSiteUrl } from '@/lib/site-url';

const log = createLogger({ module: 'stripe-payment-gateway' });
const ZERO_DECIMAL_CURRENCIES = new Set(['clp', 'jpy', 'krw']);

function normalizeCurrency(currency: string): string {
  const normalized = currency.trim().toLowerCase();
  if (!normalized) {
    throw new Error('Currency is required for Stripe checkout');
  }
  return normalized;
}

function toStripeAmount(value: number, currency: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Amount must be a finite number greater than 0');
  }

  if (ZERO_DECIMAL_CURRENCIES.has(currency)) {
    return Math.round(value);
  }

  return Math.round(value * 100);
}

export class StripePaymentGateway implements PaymentGateway {
  private readonly stripe: Stripe;
  private readonly siteUrl: string;

  constructor() {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required for StripePaymentGateway');
    }

    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });
    this.siteUrl = getSiteUrl();
  }

  async createSession(params: {
    orderId: string;
    email: string;
    amount: number;
    currency: string;
    items: Array<{ name: string; price: number; quantity: number; images: string[] }>;
    metadata?: Record<string, string>;
  }): Promise<Result<{ url: string; sessionId: string }, DomainError>> {
    if (params.items.length === 0) {
      return Result.err(
        new DomainError('Cannot create Stripe session without items', 'PAYMENT_SESSION_FAILED'),
      );
    }

    const currency = normalizeCurrency(params.currency);
    const lineItems = params.items.map((item) => {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error(`Invalid quantity for item ${item.name}`);
      }

      const unitAmount = toStripeAmount(item.price, currency);
      return {
        price_data: {
          currency,
          product_data: {
            name: item.name,
            images: item.images,
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    const expectedTotal = toStripeAmount(params.amount, currency);
    const computedTotal = lineItems.reduce(
      (sum, item) => sum + item.price_data.unit_amount * item.quantity,
      0,
    );

    if (Math.abs(computedTotal - expectedTotal) > lineItems.length) {
      return Result.err(
        new DomainError(
          'Order amount mismatch detected before Stripe session creation',
          'PAYMENT_SESSION_FAILED',
        ),
      );
    }

    const minCharge = ZERO_DECIMAL_CURRENCIES.has(currency) ? 50 : 50;
    if (expectedTotal < minCharge) {
      return Result.err(
        new DomainError(
          'Order amount does not satisfy Stripe minimum charge requirements',
          'PAYMENT_SESSION_FAILED',
        ),
      );
    }

    try {
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
            expectedAmount: String(expectedTotal),
          },
        },
        {
          idempotencyKey: `checkout:${params.orderId}`,
        },
      );

      if (!session.url) {
        return Result.err(
          new DomainError('Stripe session created without URL', 'PAYMENT_SESSION_FAILED'),
        );
      }

      return Result.ok({
        url: session.url,
        sessionId: session.id,
      });
    } catch (error) {
      log.error('Failed to create Stripe checkout session', {
        orderId: params.orderId,
        currency,
        error: error instanceof Error ? error.message : String(error),
      });
      return Result.err(
        new DomainError(
          error instanceof Error ? error.message : String(error),
          'PAYMENT_SESSION_FAILED',
        ),
      );
    }
  }
}
