'use server';

import { createClient } from '@pranakaia/infrastructure/auth/server';

export interface CustomerSignupInput {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  agreeToTerms?: boolean;
}

/**
 * Register User Action (Web App Layer)
 * Proxies to the centralized Auth Shield for consistent governance.
 */
export async function registerUser(formData: CustomerSignupInput) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          firstName: formData.firstName || '',
          lastName: formData.lastName || '',
          role: 'CUSTOMER',
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Error al crear la cuenta.',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error inesperado al registrarse.',
    };
  }
}
