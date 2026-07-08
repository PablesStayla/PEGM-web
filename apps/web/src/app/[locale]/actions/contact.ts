'use server';

import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

type ContactFormData = z.infer<typeof ContactSchema>;

async function sendContactMessage(data: ContactFormData) {
  try {
    ContactSchema.parse(data);
    return { success: true, message: 'Mensaje recibido. Te contactaremos pronto.' };
  } catch (_error) {
    return { success: false, error: 'Datos inválidos' };
  }
}

// Alias accepted by the contact page (passes an object, not FormData)
export const submitContactForm = sendContactMessage;
