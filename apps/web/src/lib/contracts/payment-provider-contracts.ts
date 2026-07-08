import { z } from 'zod';

export const StripeWebhookEventSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z
    .object({
      object: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
});

export type StripeWebhookEventContract = z.infer<typeof StripeWebhookEventSchema>;

export const FlowWebhookTokenSchema = z.object({
  token: z.string().min(1),
});

export const FlowVerificationResultSchema = z.object({
  success: z.boolean(),
  flowOrder: z.number().int().nonnegative(),
  status: z.number().int().nonnegative(),
  orderId: z.string().min(1),
  amount: z.number(),
  currency: z.string().min(1),
});

export type FlowVerificationResultContract = z.infer<typeof FlowVerificationResultSchema>;
