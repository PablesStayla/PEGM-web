"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, not } from "drizzle-orm";
import { getDb } from "@/db";
import { auditLog, messages } from "@/db/schema";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Formulario de contacto público + bandeja de mensajes del panel.
 */

export type ContactState = { ok?: boolean; error?: string };

export async function sendMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const honeypot = String(formData.get("empresa") ?? "").trim();

  // Honeypot anti-bots: si el campo oculto viene lleno, fingir éxito.
  if (honeypot) return { ok: true };

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || body.length < 10) {
    return {
      error:
        "Revisa los campos: nombre, un correo válido y un mensaje de al menos 10 caracteres.",
    };
  }

  try {
    getDb().insert(messages).values({ name, email, body }).run();
  } catch {
    return {
      error:
        "No se pudo enviar el mensaje en este momento. Escríbeme directo a mi correo.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/mensajes");
  return { ok: true };
}

async function requireUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) throw new Error("No autorizado");
  return session;
}

export async function toggleMessageRead(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  if (!id) redirect("/admin/mensajes");

  const row = getDb()
    .select()
    .from(messages)
    .where(eq(messages.id, id))
    .limit(1)
    .all()[0];
  if (row) {
    getDb()
      .update(messages)
      .set({ read: not(messages.read) })
      .where(eq(messages.id, id))
      .run();
  }

  revalidatePath("/admin");
  revalidatePath("/admin/mensajes");
  redirect("/admin/mensajes");
}

export async function deleteMessage(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  if (id) {
    getDb().delete(messages).where(eq(messages.id, id)).run();
    getDb()
      .insert(auditLog)
      .values({
        userEmail: user.email,
        action: "eliminó",
        entity: "mensaje",
        detail: `#${id}`,
      })
      .run();
  }
  revalidatePath("/admin");
  revalidatePath("/admin/mensajes");
  redirect("/admin/mensajes");
}
