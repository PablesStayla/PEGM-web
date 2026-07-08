'use server';

import type { AdminLoginInput } from '@pranakaia/domain';
import { cookies } from 'next/headers';

export async function adminLoginAction(data: AdminLoginInput) {
  // Staff login simulation
  if (data.email === 'admin@pranakaia.com' && data.password === 'password123') {
    // Set a mock session cookie
    const cookieStore = await cookies();
    cookieStore.set('pk-admin-local', 'true', {
      path: '/',
      maxAge: 60 * 60, // 1 hour
      sameSite: 'lax',
    });
    return { success: true, mfaRequired: false };
  }

  if (data.email === 'admin@pranakaia.com' && data.password === 'mfa123') {
    // MFA required demo
    return { success: true, mfaRequired: true };
  }

  return { success: false, error: 'Credenciales de Staff inválidas o cuenta no autorizada.' };
}

export async function verifyAgeAction() {
  const cookieStore = await cookies();
  cookieStore.set('pk-age-verified', 'true', {
    path: '/',
    maxAge: 365 * 24 * 60 * 60, // 1 year
    sameSite: 'lax',
  });
  return { success: true };
}
