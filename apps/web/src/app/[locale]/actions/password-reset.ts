'use server';

import { getSiteUrl } from '@/lib/site-url';
import { createClient } from '@/lib/supabase/server';

/**
 * Request a password reset email.
 *
 * Uses Supabase Auth built-in email flow. For a custom-branded email,
 * disable Supabase's default template in Dashboard → Auth → Email Templates
 * and integrate with Resend or similar provider.
 */
export async function requestPasswordReset(email: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: 'No se pudo procesar la solicitud. Verifica tu email.',
      };
    }

    return {
      success: true,
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.',
    };
  } catch {
    return {
      success: false,
      error: 'Error al procesar la solicitud.',
    };
  }
}
