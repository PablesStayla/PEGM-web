'use server';

import { z } from 'zod';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

/**
 * Request a password reset.
 * In production, this would send an email with a token.
 * For now, it validates the email exists and logs the request.
 */
export async function requestPasswordReset(formData: { email: string }) {
  try {
    ForgotPasswordSchema.parse(formData);

    // Always return success (don't reveal if email exists)
    return {
      success: true,
      message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Email inválido' };
    }
    return {
      success: false,
      error: 'Error al procesar la solicitud. Intenta nuevamente.',
    };
  }
}
