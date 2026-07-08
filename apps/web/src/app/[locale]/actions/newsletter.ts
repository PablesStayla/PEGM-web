'use server';

import { db, newsletterSubscribers } from '@pranakaia/infrastructure/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const NewsletterSchema = z.object({
  email: z.string().email(),
  acceptsMarketing: z.boolean().optional(),
});

type NewsletterData = z.infer<typeof NewsletterSchema>;

export async function subscribeToNewsletter(data: NewsletterData) {
  try {
    NewsletterSchema.parse(data);

    // Upsert: si ya existe, reactivar
    const existing = await db
      .select({ id: newsletterSubscribers.id, status: newsletterSubscribers.status })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, data.email));

    if (existing.length > 0) {
      const first = existing[0];
      if (first && first.status === 'active') {
        return { success: true, message: '¡Ya estás suscrito!' };
      }
      // Reactivar suscripción
      await db
        .update(newsletterSubscribers)
        .set({
          status: 'active',
          unsubscribedAt: null,
          acceptsMarketing: data.acceptsMarketing ?? true,
        })
        .where(eq(newsletterSubscribers.email, data.email));

      return { success: true, message: '¡Suscripción reactivada!' };
    }

    await db.insert(newsletterSubscribers).values({
      email: data.email,
      acceptsMarketing: data.acceptsMarketing ?? true,
      status: 'active',
      source: 'website',
    });

    return { success: true, message: '¡Gracias por suscribirte!' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Email inválido' };
    }
    return { success: false, error: 'Error al suscribirse. Intenta nuevamente.' };
  }
}

export async function unsubscribeFromNewsletter(email: string) {
  try {
    await db
      .update(newsletterSubscribers)
      .set({ status: 'unsubscribed', unsubscribedAt: new Date() })
      .where(eq(newsletterSubscribers.email, email));

    return { success: true, message: 'Te has dado de baja correctamente.' };
  } catch (_error) {
    return { success: false, error: 'Error al procesar la solicitud.' };
  }
}
