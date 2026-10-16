/**
 * Credenciales del administrador inicial (semilla).
 *
 * En desarrollo/test valen los valores por defecto. En producción son
 * obligatorias vía entorno y se rechaza la contraseña por defecto
 * (misma filosofía fail-fast que AUTH_SECRET en src/lib/auth.ts).
 */
const DEFAULT_ADMIN_EMAIL = "admin@pablo.cl";
const DEFAULT_ADMIN_PASSWORD = "admin1234";

/**
 * Error de configuración de credenciales de semilla.
 * `src/db/index.ts` lo propaga sin capturar: en producción, un arranque
 * sin ADMIN_* configurados falla a propósito en vez de quedar degradado.
 */
export class SeedCredentialsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SeedCredentialsError";
  }
}

export function resolveInitialAdminCredentials(
  env: Record<string, string | undefined> = process.env,
): {
  email: string;
  password: string;
} {
  const email = env.ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL;
  const password = env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  if (env.NODE_ENV === "production") {
    const hasEmail = Boolean(env.ADMIN_EMAIL?.trim());
    const hasPassword = Boolean(env.ADMIN_PASSWORD?.trim());
    if (!hasEmail || !hasPassword) {
      throw new SeedCredentialsError(
        "En producción, ADMIN_EMAIL y ADMIN_PASSWORD son obligatorias para sembrar la base de datos. Defínelas en el entorno (Vercel → Settings → Environment Variables).",
      );
    }
    if (password === DEFAULT_ADMIN_PASSWORD) {
      throw new SeedCredentialsError(
        "En producción, ADMIN_PASSWORD no puede ser la contraseña por defecto. Define una contraseña única y larga.",
      );
    }
  }

  return { email, password };
}
