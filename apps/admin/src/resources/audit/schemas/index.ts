import { z } from 'zod';

export const auditLogFilterSchema = z.object({
  userId: z.string().optional(),
  resource: z.string().optional(),
  action: z.string().optional(),
  severity: z.enum(['info', 'warning', 'error', 'critical']).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(50),
  search: z.string().optional(),
});
