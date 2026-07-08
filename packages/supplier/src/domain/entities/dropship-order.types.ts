import type { Money } from '@pranakaia/shared-kernel';
import { z } from 'zod';

/**
 * Type guard for Money-like objects.
 *
 * @example
 * ```ts
 * if (isMoneyLike(value)) { value.multiply(2); }
 * ```
 */
export const isMoneyLike = (value: unknown): value is Money =>
  typeof value === 'object' &&
  value !== null &&
  'amount' in value &&
  typeof (value as { amount?: unknown }).amount === 'number' &&
  'multiply' in value &&
  typeof (value as { multiply?: unknown }).multiply === 'function';

/**
 * Zod enum for dropship order lifecycle statuses.
 *
 * @example
 * ```ts
 * const status = DropshipOrderStatusSchema.parse('PENDING'); // 'PENDING'
 * ```
 */
export const DropshipOrderStatusSchema = z.enum([
  'PENDING',
  'SUBMITTED',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'FAILED',
  'RETURNED',
  'SENT_TO_SUPPLIER',
  'RETRY_PENDING',
  'RETRY_DELAYED',
]);
export type DropshipOrderStatus = z.infer<typeof DropshipOrderStatusSchema>;

/**
 * Zod schema for DropshipOrder entity validation.
 *
 * @example
 * ```ts
 * const parsed = DropshipOrderPropsSchema.safeParse(rawRow);
 * if (!parsed.success) console.error(parsed.error);
 * ```
 */
export const DropshipOrderPropsSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  orderId: z.string(),
  orderItemId: z.string(),
  supplierId: z.string(),
  supplierProductId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitCost: z.custom<Money>(isMoneyLike),
  totalCost: z.custom<Money>(isMoneyLike),
  shippingAddress: z.record(z.string(), z.unknown()),
  status: DropshipOrderStatusSchema,
  supplierOrderId: z.string().optional().nullable(),
  supplierOrderNumber: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  carrier: z.string().optional().nullable(),
  shippingMethod: z.string().optional().nullable(),
  shippingCost: z.custom<Money>(isMoneyLike).optional().nullable(),
  notes: z.string().optional().nullable(),
  errors: z.array(z.string()),
  retryCount: z.number().int().min(0),
  autoSubmit: z.boolean(),
  submittedAt: z.date().optional().nullable(),
  confirmedAt: z.date().optional().nullable(),
  shippedAt: z.date().optional().nullable(),
  deliveredAt: z.date().optional().nullable(),
  cancelledAt: z.date().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DropshipOrderProps = z.infer<typeof DropshipOrderPropsSchema>;

/** Terminal statuses — no further transitions possible. */
export const TERMINAL_STATUSES: DropshipOrderStatus[] = ['DELIVERED', 'CANCELLED', 'RETURNED'];

/** Maximum retry count for failed submissions. */
export const MAX_RETRIES = 3;

/** @deprecated Use DropshipOrderProps instead */
export type DropshipOrder = DropshipOrderProps;
