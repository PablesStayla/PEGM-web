"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
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

  try {
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
