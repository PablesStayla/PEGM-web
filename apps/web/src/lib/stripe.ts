/**
 * @file apps/web/src/lib/stripe.ts
 *
 * Stripe SDK singleton and helpers.
 *
 * Design:
 * - Lazy singleton: the Stripe client is created only when first needed,
 *   not at module load time (prevents build failures when STRIPE_SECRET_KEY
 *   is absent in CI environments that don't need it).
 * - constructWebhookEvent() validates HMAC signature before processing.
 * - createCheckoutSession() is typed and CLP-aware.
 *
 * Never import this module client-side. It contains server secrets.
 */

import Stripe from 'stripe';
import { env } from './env';
import { createLogger } from './logger';

const log = createLogger({ module: 'stripe' });

// ── Lazy singleton ────────────────────────────────────────────────────────────

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (_stripe) {
    return _stripe;
  }

  const key = env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. ' +
        'Add it to your .env.local or Vercel environment variables.',
    );
  }

  _stripe = new Stripe(key, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
    // Timeout after 30s to prevent hanging requests
    timeout: 30_000,
    // Retry up to 2 times on network errors
    maxNetworkRetries: 2,
    appInfo: {
      name: 'PranaKaia GrowShop',
      version: env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0',
      url: 'https://pranakaia.cl',
    },
  });

  log.debug('Stripe client initialised');
  return _stripe;
}
// Export as a getter so it's lazily created

// ── Types ─────────────────────────────────────────────────────────────────────

interface CheckoutLineItem {
  name: string;
  description?: string;
  images?: string[];
  /** Unit amount in the smallest currency unit (CLP = pesos, no cents) */
  unit_amount: number;
  currency: 'clp' | 'usd' | 'eur';
  quantity: number;
}

interface CreateCheckoutSessionParams {
  customerId?: string;
  customerEmail: string;
  lineItems: CheckoutLineItem[];
  successUrl: string;
  cancelUrl: string;
  /** All values must be strings (Stripe metadata limitation) */
  metadata?: Record<string, string>;
  /** Idempotency key to prevent duplicate charges */
  idempotencyKey?: string;
}

// ── Functions ─────────────────────────────────────────────────────────────────

/**
 * Create a Stripe Checkout Session.
 * Supports CLP (Chilean peso) out of the box.
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
): Promise<Stripe.Checkout.Session> {
  const client = getStripe();

  log.info('Creating Stripe checkout session', {
    customerEmail: '[REDACTED]',
    itemCount: params.lineItems.length,
  });

  const session = await client.checkout.sessions.create(
    {
      mode: 'payment',
      customer_email: params.customerId ? undefined : params.customerEmail,
      customer: params.customerId,
      line_items: params.lineItems.map((item) => ({
        price_data: {
          currency: item.currency,
          product_data: {
            name: item.name,
            description: item.description,
            images: item.images,
          },
          unit_amount: item.unit_amount,
        },
        quantity: item.quantity,
      })),
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
      shipping_address_collection: {
        // Latin American countries PranaKaia ships to
        allowed_countries: ['CL', 'AR', 'BR', 'UY', 'PE', 'CO'],
      },
      // Automatic tax calculation (requires Stripe Tax to be configured)
      automatic_tax: { enabled: false },
    },
    params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : undefined,
  );

  log.info('Stripe checkout session created', { sessionId: session.id });
  return session;
}

/**
 * Verify and construct a Stripe webhook event.
 * Throws if the signature is invalid — never process unverified events.
 */
export function constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET is not set. ' + 'Retrieve it from the Stripe Dashboard → Webhooks.',
    );
  }

  try {
    return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    log.warn('Stripe webhook signature verification failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Flush the Stripe singleton (test utility only).
 * Call this in afterEach() if tests change STRIPE_SECRET_KEY.
 */
export function _resetStripeClient(): void {
  _stripe = null;
}
