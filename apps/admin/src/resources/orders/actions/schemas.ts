import { z } from 'zod';

export const adminOrderFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.string(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
  note: z.string().optional(),
});

export const exportOrdersSchema = adminOrderFiltersSchema;

export const cancelOrderSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().optional(),
});

export const refundOrderSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().optional(),
});
