'use server';

import { getSiteUrl } from '../../../lib/site-url';
import { createCheckoutSession } from '../../../lib/stripe';

/**
 * Legacy compatibility action for old checkout entry points.
 * New checkout should use the centralized CheckoutService flow.
 */

export async function createStripeCheckoutSession(data: {
  items: Array<{ productId: string; name: string; price: number; quantity: number }>;
  email?: string;
}) {
  try {
    if (!data.email) {
      return { success: false, error: 'Email is required to create checkout session' };
    }

    const siteUrl = getSiteUrl();

    const session = await createCheckoutSession({
      customerEmail: data.email,
      lineItems: data.items.map((item) => ({
        name: item.name,
        unit_amount: Math.round(item.price),
        currency: 'clp',
        quantity: item.quantity,
      })),
      successUrl: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${siteUrl}/checkout`,
      metadata: {
        source: 'legacy_stripe_checkout_action',
      },
    });

    if (!session.url) {
      return { success: false, error: 'Stripe session has no redirect URL' };
    }

    return { success: true, url: session.url };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Stripe error' };
  }
}
