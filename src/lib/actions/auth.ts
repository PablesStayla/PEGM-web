"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { clearRateLimit, consumeRateLimit, requestFingerprint } from "@/lib/rate-limit";
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

  let name = "";
  let valid = false;
  let accountFingerprint = "";

  try {
    const [requestId, accountId] = await Promise.all([
      requestFingerprint(),
      requestFingerprint(email),
    ]);
    accountFingerprint = accountId;
    const ipLimit = await consumeRateLimit("login-ip", requestId, {
      limit: 30,
      windowMs: 15 * 60_000,
    });
    const accountLimit = await consumeRateLimit("login-account", accountId, {
      limit: 5,
      windowMs: 15 * 60_000,
    });
    if (!ipLimit.allowed || !accountLimit.allowed) {
      const retryAfter = Math.max(ipLimit.retryAfter, accountLimit.retryAfter);
      return {
        error: `Demasiados intentos. Vuelve a probar en ${Math.ceil(retryAfter / 60)} min.`,
      };
    }

    const db = await getDb();
    const user = (await db.select().from(users).where(eq(users.email, email)).limit(1).all())[0];
    if (user && verifyPassword(password, user.passwordHash)) {
      valid = true;
      name = user.name;
    }
  } catch {
    return { error: "La base de datos no está disponible." };
  }

  if (!valid) {
    return { error: "Credenciales inválidas." };
  }

  await clearRateLimit("login-account", accountFingerprint);
  const token = await createSessionToken({ email, name });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions);

  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
