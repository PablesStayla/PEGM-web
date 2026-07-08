import type { Result } from '../../libraries/types.js';
import { failure, success } from '../../libraries/types.js';
import type { AdminCredentials, AdminSetupConfig } from './admin-types.js';
import { AdminCredentialsSchema } from './admin-types.js';

export function validateCredentials(
  email: unknown,
  password: unknown,
): Result<AdminCredentials, string> {
  const parsed = AdminCredentialsSchema.safeParse({ email, password });
  if (!parsed.success) {
    return failure(`Invalid admin credentials: ${parsed.error.message}`);
  }
  return success(parsed.data);
}

export function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const length = 24;
  const segments = [
    randomChars(chars, length - 4),
    randomChars('!@#$%^&*', 1),
    randomChars('0123456789', 1),
    randomChars('abcdefghijklmnopqrstuvwxyz', 1),
    randomChars('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 1),
  ];
  return shuffle(segments.join(''));
}

export function maskSecret(secret: string): string {
  if (secret.length <= 8) {
    return '****';
  }
  return secret.slice(0, 4) + '*'.repeat(secret.length - 8) + secret.slice(-4);
}

export function buildAdminConfig(
  env: Record<string, string | undefined>,
): Result<AdminSetupConfig, string> {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    return failure('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!serviceRoleKey) {
    return failure('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  const email = env.ADMIN_EMAIL || 'admin@pranakaia.cl';
  const password = env.ADMIN_PASSWORD || generateSecurePassword();

  const credResult = validateCredentials(email, password);
  if (!credResult.success) {
    return credResult;
  }

  return success({
    email: credResult.data.email,
    password: credResult.data.password,
    supabaseUrl,
    serviceRoleKey,
  });
}

function randomChars(charset: string, length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

function shuffle(str: string): string {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr.join('');
}
