"use server";

import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { clientIp, consumeRateLimit, rateLimitKey, resetRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const from = String(formData.get("from") ?? "/admin") || "/admin";

  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { email, password } = parsed.data;

  // 5 intentos / 15 min por (IP + correo). Los fallos de Zod no cuentan.
  const headerList = await headers();
  const key = rateLimitKey("login", `${clientIp(headerList)}:${email.toLowerCase()}`);
  try {
    if (!(await consumeRateLimit(key, 5, 15 * 60 * 1000))) {
      return { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
    }
  } catch {
    // Sin rate limit disponible (BD caída): el login fallará abajo con su propio error.
  }

  let userRow: { name: string; passwordHash: string; sessionEpoch: number } | undefined;

  try {
    const db = await getDb();
    const user = (await db.select().from(users).where(eq(users.email, email)).limit(1).all())[0];
    if (user && (await verifyPassword(password, user.passwordHash))) {
      userRow = user;
    }
  } catch {
    return { error: "La base de datos no está disponible." };
  }

  if (!userRow) {
    return { error: "Credenciales inválidas." };
  }

  // Login exitoso: limpia el contador de intentos fallidos.
  try {
    await resetRateLimit(key);
  } catch {
    // el reset es best-effort
  }

  const token = await createSessionToken({
    email,
    name: userRow.name,
    epoch: userRow.sessionEpoch,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions);

  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
