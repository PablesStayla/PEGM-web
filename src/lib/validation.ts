import { z } from "zod";

/**
 * Esquemas de validación de entrada (Zod 4).
 * Se usan en las server actions expuestas al público.
 */

export const loginSchema = z.object({
  email: z.email("Ingresa un correo válido.").transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Ingresa tu nombre.").max(120),
  email: z.email("Ingresa un correo válido."),
  body: z
    .string()
    .trim()
    .min(10, "El mensaje debe tener al menos 10 caracteres.")
    .max(5000, "El mensaje es demasiado largo."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
