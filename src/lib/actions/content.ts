"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import * as t from "@/db/schema";
import { requireAdminSession } from "@/lib/admin-session";
import { audit } from "@/lib/audit";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { adminGetSettings } from "@/lib/data";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  certificationSchema,
  changePasswordSchema,
  educationSchema,
  experienceSchema,
  languageSchema,
  projectSchema,
  settingsSchema,
  skillSchema,
} from "@/lib/validation";

/**
 * Acciones de servidor para administrar el contenido del sitio.
 * Todas exigen sesión válida y dejan registro en la auditoría.
 */

function refreshPublicPages() {
  revalidatePath("/");
  revalidatePath("/cv");
  revalidatePath("/proyectos");
}

// ── Helpers de formulario ───────────────────────────────────────────────────

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string, fallback = 0): number {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function bool(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true";
}

function lines(formData: FormData, key: string): string[] {
  return str(formData, key)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function csv(formData: FormData, key: string): string[] {
  return str(formData, key)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function idOrThrow(formData: FormData, backTo: string): number {
  const id = num(formData, "id");
  if (!id) redirect(`${backTo}?error=missing-id`);
  return id;
}

// ── Ajustes del sitio ───────────────────────────────────────────────────────

export async function saveSettings(formData: FormData) {
  const user = await requireAdminSession();
  const raw = {
    name: str(formData, "name"),
    title: str(formData, "title"),
    tagline: str(formData, "tagline"),
    location: str(formData, "location"),
    email: str(formData, "email"),
    linkedin: str(formData, "linkedin"),
    github: str(formData, "github"),
    availability: str(formData, "availability"),
    aboutHeading: str(formData, "aboutHeading"),
    aboutP1: str(formData, "aboutP1"),
    aboutP2: str(formData, "aboutP2"),
    aboutP3: str(formData, "aboutP3"),
  };
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    redirect("/admin/ajustes?error=invalid");
  }
  const values = { ...parsed.data, updatedAt: new Date() };

  const db = await getDb();
  const before = await adminGetSettings();
  await db.update(t.settings).set(values).where(eq(t.settings.id, 1)).run();
  await audit({
    userEmail: user.email,
    action: "actualizó",
    entity: "ajustes del sitio",
    event: "content.save_settings",
    before,
    after: values,
  });
  refreshPublicPages();
  revalidatePath("/admin/ajustes");
  redirect("/admin/ajustes?saved=1");
}

export async function changePassword(formData: FormData) {
  const user = await requireAdminSession();
  const raw = {
    current: str(formData, "current"),
    next: str(formData, "next"),
  };
  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    redirect("/admin/ajustes?error=invalid");
  }
  const { current, next } = parsed.data;

  const db = await getDb();
  const row = (
    await db.select().from(t.users).where(eq(t.users.email, user.email)).limit(1).all()
  )[0];

  if (!row || !(await verifyPassword(current, row.passwordHash))) {
    redirect("/admin/ajustes?error=password-wrong");
  }

  // Incrementa el epoch: revoca todas las sesiones emitidas con el anterior.
  const nextEpoch = row.sessionEpoch + 1;

  await db
    .update(t.users)
    .set({ passwordHash: await hashPassword(next), sessionEpoch: nextEpoch })
    .where(eq(t.users.id, row.id))
    .run();
  await audit({
    userEmail: user.email,
    action: "actualizó",
    entity: "contraseña",
    event: "auth.change_password",
  });

  // Re-emite la cookie de ESTA sesión con el nuevo epoch (las demás quedan revocadas).
  const store = await cookies();
  store.set(
    SESSION_COOKIE,
    await createSessionToken({ email: user.email, name: user.name, epoch: nextEpoch }),
    sessionCookieOptions,
  );

  redirect("/admin/ajustes?saved=password");
}

// ── Proyectos ───────────────────────────────────────────────────────────────

export async function saveProject(formData: FormData) {
  const user = await requireAdminSession();
  const id = num(formData, "id");
  const raw = {
    title: str(formData, "title"),
    category: str(formData, "category"),
    year: str(formData, "year"),
    summary: str(formData, "summary"),
    tags: csv(formData, "tags"),
    featured: bool(formData, "featured"),
    sortOrder: num(formData, "sortOrder"),
  };
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    redirect("/admin/proyectos?error=invalid");
  }
  const values = { ...parsed.data, updatedAt: new Date() };

  const db = await getDb();
  if (id) {
    const before = (
      await db.select().from(t.projects).where(eq(t.projects.id, id)).limit(1).all()
    )[0];
    await db.update(t.projects).set(values).where(eq(t.projects.id, id)).run();
    await audit({
      userEmail: user.email,
      action: "actualizó",
      entity: "proyecto",
      detail: values.title,
      event: "content.update_project",
      before,
      after: values,
    });
  } else {
    await db.insert(t.projects).values(values).run();
    await audit({
      userEmail: user.email,
      action: "creó",
      entity: "proyecto",
      detail: values.title,
      event: "content.create_project",
      after: values,
    });
  }

  refreshPublicPages();
  revalidatePath("/admin/proyectos");
  redirect("/admin/proyectos?saved=1");
}

export async function deleteProject(formData: FormData) {
  const user = await requireAdminSession();
  const id = idOrThrow(formData, "/admin/proyectos");
  const db = await getDb();
  const before = (
    await db.select().from(t.projects).where(eq(t.projects.id, id)).limit(1).all()
  )[0];
  await db.delete(t.projects).where(eq(t.projects.id, id)).run();
  await audit({
    userEmail: user.email,
    action: "eliminó",
    entity: "proyecto",
    detail: `#${id}`,
    event: "content.delete_project",
    before,
  });
  refreshPublicPages();
  revalidatePath("/admin/proyectos");
  redirect("/admin/proyectos?deleted=1");
}

// ── Experiencia ─────────────────────────────────────────────────────────────

export async function saveExperience(formData: FormData) {
  const user = await requireAdminSession();
  const id = num(formData, "id");
  const raw = {
    period: str(formData, "period"),
    role: str(formData, "role"),
    company: str(formData, "company"),
    highlights: lines(formData, "highlights"),
    sortOrder: num(formData, "sortOrder"),
  };
  const parsed = experienceSchema.safeParse(raw);
  if (!parsed.success) {
    redirect("/admin/experiencia?error=invalid");
  }
  const values = { ...parsed.data, updatedAt: new Date() };

  const db = await getDb();
  if (id) {
    const before = (
      await db.select().from(t.experience).where(eq(t.experience.id, id)).limit(1).all()
    )[0];
    await db.update(t.experience).set(values).where(eq(t.experience.id, id)).run();
    await audit({
      userEmail: user.email,
      action: "actualizó",
      entity: "experiencia",
      detail: values.role,
      event: "content.update_experience",
      before,
      after: values,
    });
  } else {
    await db.insert(t.experience).values(values).run();
    await audit({
      userEmail: user.email,
      action: "creó",
      entity: "experiencia",
      detail: values.role,
      event: "content.create_experience",
      after: values,
    });
  }

  refreshPublicPages();
  revalidatePath("/admin/experiencia");
  redirect("/admin/experiencia?saved=1");
}

export async function deleteExperience(formData: FormData) {
  const user = await requireAdminSession();
  const id = idOrThrow(formData, "/admin/experiencia");
  const db = await getDb();
  const before = (
    await db.select().from(t.experience).where(eq(t.experience.id, id)).limit(1).all()
  )[0];
  await db.delete(t.experience).where(eq(t.experience.id, id)).run();
  await audit({
    userEmail: user.email,
    action: "eliminó",
    entity: "experiencia",
    detail: `#${id}`,
    event: "content.delete_experience",
    before,
  });
  refreshPublicPages();
  revalidatePath("/admin/experiencia");
  redirect("/admin/experiencia?deleted=1");
}

// ── Educación ───────────────────────────────────────────────────────────────

export async function saveEducation(formData: FormData) {
  const user = await requireAdminSession();
  const id = num(formData, "id");
  const raw = {
    period: str(formData, "period"),
    degree: str(formData, "degree"),
    school: str(formData, "school"),
    note: str(formData, "note"),
    sortOrder: num(formData, "sortOrder"),
  };
  const parsed = educationSchema.safeParse(raw);
  if (!parsed.success) {
    redirect("/admin/educacion?error=invalid");
  }
  const values = { ...parsed.data, updatedAt: new Date() };

  const db = await getDb();
  if (id) {
    const before = (
      await db.select().from(t.education).where(eq(t.education.id, id)).limit(1).all()
    )[0];
    await db.update(t.education).set(values).where(eq(t.education.id, id)).run();
    await audit({
      userEmail: user.email,
      action: "actualizó",
      entity: "educación",
      detail: values.degree,
      event: "content.update_education",
      before,
      after: values,
    });
  } else {
    await db.insert(t.education).values(values).run();
    await audit({
      userEmail: user.email,
      action: "creó",
      entity: "educación",
      detail: values.degree,
      event: "content.create_education",
      after: values,
    });
  }

  refreshPublicPages();
  revalidatePath("/admin/educacion");
  redirect("/admin/educacion?saved=1");
}

export async function deleteEducation(formData: FormData) {
  const user = await requireAdminSession();
  const id = idOrThrow(formData, "/admin/educacion");
  const db = await getDb();
  const before = (
    await db.select().from(t.education).where(eq(t.education.id, id)).limit(1).all()
  )[0];
  await db.delete(t.education).where(eq(t.education.id, id)).run();
  await audit({
    userEmail: user.email,
    action: "eliminó",
    entity: "educación",
    detail: `#${id}`,
    event: "content.delete_education",
    before,
  });
  refreshPublicPages();
  revalidatePath("/admin/educacion");
  redirect("/admin/educacion?deleted=1");
}

// ── Certificaciones ─────────────────────────────────────────────────────────

export async function saveCertification(formData: FormData) {
  const user = await requireAdminSession();
  const id = num(formData, "id");
  const raw = {
    name: str(formData, "name"),
    sortOrder: num(formData, "sortOrder"),
  };
  const parsed = certificationSchema.safeParse(raw);
  if (!parsed.success) {
    redirect("/admin/educacion?error=invalid");
  }
  const { name, sortOrder } = parsed.data;

  const db = await getDb();
  if (id) {
    const before = (
      await db.select().from(t.certifications).where(eq(t.certifications.id, id)).limit(1).all()
    )[0];
    await db
      .update(t.certifications)
      .set({ name, sortOrder })
      .where(eq(t.certifications.id, id))
      .run();
    await audit({
      userEmail: user.email,
      action: "actualizó",
      entity: "certificación",
      detail: name,
      event: "content.update_certification",
      before,
      after: { name, sortOrder },
    });
  } else {
    await db.insert(t.certifications).values({ name, sortOrder }).run();
    await audit({
      userEmail: user.email,
      action: "creó",
      entity: "certificación",
      detail: name,
      event: "content.create_certification",
      after: { name, sortOrder },
    });
  }

  refreshPublicPages();
  revalidatePath("/admin/educacion");
  redirect("/admin/educacion?saved=1");
}

export async function deleteCertification(formData: FormData) {
  const user = await requireAdminSession();
  const id = idOrThrow(formData, "/admin/educacion");
  const db = await getDb();
  const before = (
    await db.select().from(t.certifications).where(eq(t.certifications.id, id)).limit(1).all()
  )[0];
  await db.delete(t.certifications).where(eq(t.certifications.id, id)).run();
  await audit({
    userEmail: user.email,
    action: "eliminó",
    entity: "certificación",
    detail: `#${id}`,
    event: "content.delete_certification",
    before,
  });
  refreshPublicPages();
  revalidatePath("/admin/educacion");
  redirect("/admin/educacion?deleted=1");
}

// ── Idiomas ─────────────────────────────────────────────────────────────────

export async function saveLanguage(formData: FormData) {
  const user = await requireAdminSession();
  const id = num(formData, "id");
  const raw = {
    name: str(formData, "name"),
    level: str(formData, "level"),
    sortOrder: num(formData, "sortOrder"),
  };
  const parsed = languageSchema.safeParse(raw);
  if (!parsed.success) {
    redirect("/admin/educacion?error=invalid");
  }
  const values = { ...parsed.data, updatedAt: new Date() };

  const db = await getDb();
  if (id) {
    const before = (
      await db.select().from(t.languages).where(eq(t.languages.id, id)).limit(1).all()
    )[0];
    await db.update(t.languages).set(values).where(eq(t.languages.id, id)).run();
    await audit({
      userEmail: user.email,
      action: "actualizó",
      entity: "idioma",
      detail: values.name,
      event: "content.update_language",
      before,
      after: values,
    });
  } else {
    await db.insert(t.languages).values(values).run();
    await audit({
      userEmail: user.email,
      action: "creó",
      entity: "idioma",
      detail: values.name,
      event: "content.create_language",
      after: values,
    });
  }

  refreshPublicPages();
  revalidatePath("/admin/educacion");
  redirect("/admin/educacion?saved=1");
}

export async function deleteLanguage(formData: FormData) {
  const user = await requireAdminSession();
  const id = idOrThrow(formData, "/admin/educacion");
  const db = await getDb();
  const before = (
    await db.select().from(t.languages).where(eq(t.languages.id, id)).limit(1).all()
  )[0];
  await db.delete(t.languages).where(eq(t.languages.id, id)).run();
  await audit({
    userEmail: user.email,
    action: "eliminó",
    entity: "idioma",
    detail: `#${id}`,
    event: "content.delete_language",
    before,
  });
  refreshPublicPages();
  revalidatePath("/admin/educacion");
  redirect("/admin/educacion?deleted=1");
}

// ── Habilidades ─────────────────────────────────────────────────────────────

export async function saveSkill(formData: FormData) {
  const user = await requireAdminSession();
  const id = num(formData, "id");
  const raw = {
    kind: str(formData, "kind") === "area" ? "area" : "software",
    name: str(formData, "name"),
    sortOrder: num(formData, "sortOrder"),
  };
  const parsed = skillSchema.safeParse(raw);
  if (!parsed.success) {
    redirect("/admin/habilidades?error=invalid");
  }
  const values = { ...parsed.data, updatedAt: new Date() };

  const db = await getDb();
  if (id) {
    const before = (await db.select().from(t.skills).where(eq(t.skills.id, id)).limit(1).all())[0];
    await db.update(t.skills).set(values).where(eq(t.skills.id, id)).run();
    await audit({
      userEmail: user.email,
      action: "actualizó",
      entity: "habilidad",
      detail: values.name,
      event: "content.update_skill",
      before,
      after: values,
    });
  } else {
    await db.insert(t.skills).values(values).run();
    await audit({
      userEmail: user.email,
      action: "creó",
      entity: "habilidad",
      detail: values.name,
      event: "content.create_skill",
      after: values,
    });
  }

  refreshPublicPages();
  revalidatePath("/admin/habilidades");
  redirect("/admin/habilidades?saved=1");
}

export async function deleteSkill(formData: FormData) {
  const user = await requireAdminSession();
  const id = idOrThrow(formData, "/admin/habilidades");
  const db = await getDb();
  const before = (await db.select().from(t.skills).where(eq(t.skills.id, id)).limit(1).all())[0];
  await db.delete(t.skills).where(eq(t.skills.id, id)).run();
  await audit({
    userEmail: user.email,
    action: "eliminó",
    entity: "habilidad",
    detail: `#${id}`,
    event: "content.delete_skill",
    before,
  });
  refreshPublicPages();
  revalidatePath("/admin/habilidades");
  redirect("/admin/habilidades?deleted=1");
}
