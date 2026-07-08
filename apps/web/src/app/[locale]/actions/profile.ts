'use server';

import { requireAuth } from '@pranakaia/infrastructure/auth';
import { customers, db, users } from '@pranakaia/infrastructure/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
});

export async function getProfile() {
  try {
    const sessionUser = await requireAuth();

    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatar,
      })
      .from(users)
      .where(eq(users.id, sessionUser.id!))
      .limit(1);

    const user = userList[0];

    if (!user) {
      return { success: false as const, error: 'Usuario no encontrado' };
    }

    // Also get customer record if exists (for phone)
    const customerList = await db
      .select({ phone: customers.phone })
      .from(customers)
      .where(eq(customers.email, user.email))
      .limit(1);

    const customer = customerList[0];

    return {
      success: true as const,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        avatar: user.avatar || null,
        phone: customer?.phone || '',
      },
    };
  } catch {
    return { success: false as const, error: 'Debes iniciar sesión para ver tu perfil' };
  }
}

export async function updateProfile(formData: {
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  try {
    const sessionUser = await requireAuth();
    const validated = UpdateProfileSchema.parse(formData);

    await db
      .update(users)
      .set({
        firstName: validated.firstName,
        lastName: validated.lastName,
      })
      .where(eq(users.id, sessionUser.id!));

    if (validated.phone !== undefined) {
      const userList = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, sessionUser.id!))
        .limit(1);

      const user = userList[0];

      if (user) {
        await db
          .update(customers)
          .set({
            firstName: validated.firstName,
            lastName: validated.lastName,
            phone: validated.phone || null,
          })
          .where(eq(customers.email, user.email));
      }
    }

    return { success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        fieldErrors[err.path.join('.')] = err.message;
      });
      return { success: false as const, error: 'Datos inválidos', fieldErrors };
    }
    return {
      success: false as const,
      error: 'Error al actualizar el perfil. Intenta nuevamente.',
    };
  }
}
