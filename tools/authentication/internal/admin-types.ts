import { z } from 'zod';
import type { Result } from '../../libraries/types.js';

export const AdminCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(16),
});

export type AdminCredentials = z.infer<typeof AdminCredentialsSchema>;

export interface AdminSetupConfig {
  readonly email: string;
  readonly password: string;
  readonly supabaseUrl: string;
  readonly serviceRoleKey: string;
}

export interface AdminSetupResult {
  readonly userId: string;
  readonly email: string;
  readonly created: boolean;
}

export type AdminSetupOutcome = Result<AdminSetupResult, string>;

export const ENV_SCHEMA = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(16).optional(),
});

export type AdminEnv = z.infer<typeof ENV_SCHEMA>;
