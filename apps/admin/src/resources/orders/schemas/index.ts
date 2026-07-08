/**
 * Orders Schemas
 */

import { z } from 'zod';

export const adminOrderFiltersSchema = z
  .object({
    search: z.string().optional(),
    status: z.string().optional(),
    paymentStatus: z.string().optional(),
    page: z.number().default(1),
    pageSize: z.number().default(20),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .optional();

export const updateOrderStatusSchema = z.object({
  id: z.string(),
  status: z.string(),
  note: z.string().optional(),
});

export const exportOrdersSchema = z
  .object({
    status: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
  })
  .optional();

export type AdminOrderFilters = z.infer<typeof adminOrderFiltersSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ExportOrdersInput = z.infer<typeof exportOrdersSchema>;
