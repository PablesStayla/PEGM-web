import { z } from 'zod';

/**
 * Zod enum for inventory sync frequency.
 *
 * @example
 * ```ts
 * const freq = SyncFrequencySchema.parse('HOURLY'); // 'HOURLY'
 * ```
 */
export const SyncFrequencySchema = z.enum(['REALTIME', 'HOURLY', 'DAILY']);
export type SyncFrequency = z.infer<typeof SyncFrequencySchema>;

/**
 * Zod schema for Supplier entity validation.
 *
 * @example
 * ```ts
 * const parsed = SupplierPropsSchema.safeParse(rawProps);
 * if (!parsed.success) console.error(parsed.error);
 * ```
 */
export const SupplierPropsSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string().min(3),
  slug: z.string(),
  email: z.string().email(),
  businessType: z.enum(['MANUFACTURER', 'DISTRIBUTOR', 'WHOLESALER', 'DROPSHIPPER']),
  country: z.string(),
  apiEndpoint: z.string().url().optional().nullable(),
  apiKey: z.string().min(10).optional().nullable(),
  syncFrequency: SyncFrequencySchema.optional().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SupplierProps = z.infer<typeof SupplierPropsSchema>;
