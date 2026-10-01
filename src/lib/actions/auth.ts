"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin") || "/admin";

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  let name = "";
  let valid = false;

  try {
    const user = getDb()
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .all()[0];
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
