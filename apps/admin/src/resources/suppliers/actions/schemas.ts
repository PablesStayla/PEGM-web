import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  apiEndpoint: z.string().url(),
  apiKey: z.string().min(1),
  syncFrequency: z.enum(['REALTIME', 'HOURLY', 'DAILY']),
  isActive: z.boolean().default(true),
});

export const toggleSupplierSchema = z.object({
  id: z.string(),
  active: z.boolean(),
});
