"use server";

import { eq, not } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { messages } from "@/db/schema";
import { requireAdminSession } from "@/lib/admin-session";
import { audit } from "@/lib/audit";
import { clientIp, consumeRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";

/**
 * Formulario de contacto público + bandeja de mensajes del panel.
 */

export type ContactState = { ok?: boolean; error?: string };

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const honeypot = String(formData.get("empresa") ?? "").trim();

  // Honeypot anti-bots: si el campo oculto viene lleno, fingir éxito.
  if (honeypot) return { ok: true };

  const parsed = contactSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    body: String(formData.get("body") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { name, email, body } = parsed.data;

  // 5 envíos / hora por IP (después del honeypot: los bots no consumen).
  const headerList = await headers();
  const allowed = await consumeRateLimit(
    rateLimitKey("contact", clientIp(headerList)),
    5,
    60 * 60 * 1000,
  );
  if (!allowed) {
    return { error: "Demasiados mensajes enviados. Intenta más tarde." };
  }

  try {
    const db = await getDb();
    await db.insert(messages).values({ name, email, body }).run();
  } catch {
    return {
      error: "No se pudo enviar el mensaje en este momento. Escríbeme directo a mi correo.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/mensajes");
  return { ok: true };
}

export async function toggleMessageRead(formData: FormData) {
  const user = await requireAdminSession();
  const id = Number(formData.get("id"));
  if (!id) redirect("/admin/mensajes");

  const db = await getDb();
  const row = (await db.select().from(messages).where(eq(messages.id, id)).limit(1).all())[0];
  if (row) {
    await db
      .update(messages)
      .set({ read: not(messages.read) })
      .where(eq(messages.id, id))
      .run();
    await audit({
      userEmail: user.email,
      action: row.read ? "marcó como no leído" : "marcó como leído",
      entity: "mensaje",
      detail: `#${id}`,
      event: "message.toggle_read",
      before: { read: row.read },
      after: { read: !row.read },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/mensajes");
  redirect("/admin/mensajes");
}

export async function deleteMessage(formData: FormData) {
  const user = await requireAdminSession();
  const id = Number(formData.get("id"));
  if (id) {
    const db = await getDb();
    await db.delete(messages).where(eq(messages.id, id)).run();
    await audit({
      userEmail: user.email,
      action: "eliminó",
      entity: "mensaje",
      detail: `#${id}`,
      event: "message.delete",
    });
  }
  revalidatePath("/admin");
  revalidatePath("/admin/mensajes");
  redirect("/admin/mensajes");
}
