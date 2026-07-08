import { describe, expect, it } from 'vitest';
import {
  FlowVerificationResultSchema,
  FlowWebhookTokenSchema,
  StripeWebhookEventSchema,
} from './payment-provider-contracts';

describe('payment provider contracts', () => {
  it('accepts valid stripe webhook event payload', () => {
    const parsed = StripeWebhookEventSchema.safeParse({
      id: 'evt_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: {
            orderId: 'ord_123',
          },
        },
      },
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects stripe event payload without id/type', () => {
    const parsed = StripeWebhookEventSchema.safeParse({
      data: {
        object: {
          id: 'cs_test_123',
        },
      },
    });

    expect(parsed.success).toBe(false);
  });

  it('accepts valid flow token payload', () => {
    const parsed = FlowWebhookTokenSchema.safeParse({ token: 'flow-token-123' });

    expect(parsed.success).toBe(true);
  });

  it('rejects empty flow token payload', () => {
    const parsed = FlowWebhookTokenSchema.safeParse({ token: '' });

    expect(parsed.success).toBe(false);
  });

  it('accepts valid flow verification result payload', () => {
    const parsed = FlowVerificationResultSchema.safeParse({
      success: true,
      flowOrder: 12345,
      status: 2,
      orderId: 'ord_123',
      amount: 10990,
      currency: 'CLP',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects flow verification payload with invalid flowOrder', () => {
    const parsed = FlowVerificationResultSchema.safeParse({
      success: true,
      flowOrder: -1,
      status: 2,
      orderId: 'ord_123',
      amount: 10990,
      currency: 'CLP',
    });

    expect(parsed.success).toBe(false);
  });
});
