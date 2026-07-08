import Stripe from 'stripe';
import { env } from '@/lib/env';

// =====================================================
// STRIPE CLIENT - PAYMENTS CONFIGURATION
// =====================================================

/**
 * Stripe server-side client
 * Configurado con API version y TypeScript support
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
  appInfo: {
    name: 'PranaKaia E-Commerce',
    version: '1.0.0',
  },
});

/**
 * Stripe helpers para operaciones comunes
 */
export const stripeHelpers = {
  /**
   * Crear Payment Intent
   */
  async createPaymentIntent(amount: number, currency = 'usd') {
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency,
      automatic_payment_methods: { enabled: true },
    });
  },

  /**
   * Crear Customer
   */
  async createCustomer(email: string, name?: string) {
    return await stripe.customers.create({ email, name });
  },

  /**
   * Crear Checkout Session
   */
  async createCheckoutSession(params: {
    successUrl: string;
    cancelUrl: string;
    lineItems: Array<{ price: string; quantity: number }>;
    customerEmail?: string;
  }) {
    return await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      line_items: params.lineItems,
      customer_email: params.customerEmail,
    });
  },
};

export default stripe;
