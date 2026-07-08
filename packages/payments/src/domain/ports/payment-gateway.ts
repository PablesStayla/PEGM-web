import type { DomainError, Result } from '@pranakaia/shared-kernel';

/**
 * Port for payment gateway integrations (Stripe, Flow, etc.).
 *
 * @example
 * ```ts
 * class StripeGateway implements PaymentGateway {
 *   async createSession(params) {
 *     const session = await stripe.checkout.sessions.create({ ... });
 *     return Result.ok({ url: session.url, sessionId: session.id });
 *   }
 * }
 * ```
 */
export interface PaymentGateway {
  /**
   * Creates a checkout session with the payment provider.
   *
   * @param params - Order details, customer email, items, and optional metadata.
   * @returns The checkout URL and provider session ID.
   */
  createSession(params: {
    orderId: string;
    email: string;
    amount: number;
    currency: string;
    items: Array<{ name: string; price: number; quantity: number; images: string[] }>;
    metadata?: Record<string, string>;
  }): Promise<Result<{ url: string; sessionId: string }, DomainError>>;
}
