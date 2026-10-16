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

// ── Esquemas para las acciones de administración del panel ──────────────────

const nonEmptyString = (campo: string) =>
  z.string().trim().min(1, `El campo ${campo} es obligatorio.`);

const sortable = z.number().int().min(0).max(10000).default(0);

export const projectSchema = z.object({
  title: nonEmptyString("título").max(200),
  category: nonEmptyString("categoría").max(200),
  year: z.string().trim().min(1, "El año es obligatorio.").max(20),
  summary: nonEmptyString("resumen").max(2000),
  tags: z
    .array(z.string().trim().nonempty("La etiqueta no puede estar vacía."))
    .max(50, "Máximo 50 etiquetas.")
    .default([]),
  featured: z.boolean().default(false),
  sortOrder: sortable,
});

export const experienceSchema = z.object({
  period: nonEmptyString("periodo").max(100),
  role: nonEmptyString("rol").max(200),
  company: nonEmptyString("empresa").max(200),
  highlights: z.array(z.string().trim().nonempty("El destacado no puede estar vacío.")).default([]),
  sortOrder: sortable,
});

export const educationSchema = z.object({
  period: nonEmptyString("periodo").max(100),
  degree: nonEmptyString("título").max(200),
  school: nonEmptyString("institución").max(200),
  note: z.string().trim().max(1000).default(""),
  sortOrder: sortable,
});

export const certificationSchema = z.object({
  name: nonEmptyString("certificación").max(200),
  sortOrder: sortable,
});

export const languageSchema = z.object({
  name: nonEmptyString("idioma").max(200),
  level: nonEmptyString("nivel").max(100),
  sortOrder: sortable,
});

export const skillSchema = z.object({
  kind: z.enum(["area", "software"]),
  name: nonEmptyString("habilidad").max(200),
  sortOrder: sortable,
});

export const settingsSchema = z.object({
  name: nonEmptyString("nombre").max(200),
  title: nonEmptyString("título").max(200),
  tagline: nonEmptyString("eslogan").max(500),
  location: nonEmptyString("ubicación").max(200),
  email: z.string().email("Ingresa un correo válido.").min(1),
  linkedin: nonEmptyString("LinkedIn").max(300),
  github: nonEmptyString("GitHub").max(300),
  availability: nonEmptyString("disponibilidad").max(200),
  aboutHeading: nonEmptyString("título de 'sobre mí'").max(200),
  aboutP1: nonEmptyString("párrafo 1").max(2000),
  aboutP2: nonEmptyString("párrafo 2").max(2000),
  aboutP3: nonEmptyString("párrafo 3").max(2000),
});

export const changePasswordSchema = z.object({
  current: z.string().min(1, "Ingresa tu contraseña actual."),
  next: z.string().min(8, "La contraseña nueva debe tener al menos 8 caracteres."),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
export type LanguageInput = z.infer<typeof languageSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
