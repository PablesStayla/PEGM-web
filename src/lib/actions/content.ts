"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import * as t from "@/db/schema";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { slugify } from "@/lib/slug";

/**
 * Acciones de servidor para administrar el contenido del sitio.
 * Todas exigen sesión válida y dejan registro en la auditoría.
 */

async function requireUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) throw new Error("No autorizado");
  return session;
}

async function audit(userEmail: string, action: string, entity: string, detail = "") {
  const db = await getDb();
  await db.insert(t.auditLog).values({ userEmail, action, entity, detail }).run();
}

function refreshPublicPages(projectSlugs: string[] = []) {
  revalidatePath("/");
  revalidatePath("/cv");
  revalidatePath("/proyectos");
  revalidatePath("/sitemap.xml");
  for (const slug of new Set(projectSlugs.filter(Boolean))) {
    revalidatePath(`/proyectos/${slug}`);
  }
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

function metricLines(formData: FormData): { value: string; label: string }[] {
  return lines(formData, "metrics").flatMap((line) => {
    const separator = line.indexOf("|");
    if (separator < 1) return [];
    const value = line.slice(0, separator).trim();
    const label = line.slice(separator + 1).trim();
    return value && label ? [{ value, label }] : [];
  });
}

function idOrThrow(formData: FormData, backTo: string): number {
  const id = num(formData, "id");
  if (!id) redirect(`${backTo}?error=missing-id`);
  return id;
}

// ── Ajustes del sitio ───────────────────────────────────────────────────────

export async function saveSettings(formData: FormData) {
  const user = await requireUser();
  const values = {
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
    contentVerified: bool(formData, "contentVerified"),
    updatedAt: new Date(),
  };
  if (!values.name || !values.title) {
    redirect("/admin/ajustes?error=required");
  }

  const db = await getDb();
  await db.update(t.settings).set(values).where(eq(t.settings.id, 1)).run();
  await audit(user.email, "actualizó", "ajustes del sitio");
  refreshPublicPages();
  revalidatePath("/admin/ajustes");
  redirect("/admin/ajustes?saved=1");
}

export async function changePassword(formData: FormData) {
  const user = await requireUser();
  const current = str(formData, "current");
  const next = str(formData, "next");

  if (next.length < 8) {
    redirect("/admin/ajustes?error=password-short");
  }

  const db = await getDb();
  const row = (
    await db.select().from(t.users).where(eq(t.users.email, user.email)).limit(1).all()
  )[0];

  if (!row || !verifyPassword(current, row.passwordHash)) {
    redirect("/admin/ajustes?error=password-wrong");
  }

  await db
    .update(t.users)
    .set({ passwordHash: hashPassword(next) })
    .where(eq(t.users.id, row.id))
    .run();
  await audit(user.email, "actualizó", "contraseña");
  redirect("/admin/ajustes?saved=password");
}

// ── Proyectos ───────────────────────────────────────────────────────────────

export async function saveProject(formData: FormData) {
  const user = await requireUser();
  const id = num(formData, "id");
  const title = str(formData, "title");
  const slug = slugify(str(formData, "slug") || title);
  const values = {
    slug,
    title,
    category: str(formData, "category"),
    year: str(formData, "year"),
    summary: str(formData, "summary"),
    tags: csv(formData, "tags"),
    featured: bool(formData, "featured"),
    duration: str(formData, "duration"),
    context: str(formData, "context"),
    challenge: str(formData, "challenge"),
    approach: lines(formData, "approach"),
    metrics: metricLines(formData),
    results: lines(formData, "results"),
    closing: str(formData, "closing"),
    caseStudy: bool(formData, "caseStudy"),
    visualStyle: str(formData, "visualStyle") || "process",
    sortOrder: num(formData, "sortOrder"),
    updatedAt: new Date(),
  };
  if (!values.title || !values.slug) redirect("/admin/proyectos?error=required");
  if (
    values.caseStudy &&
    (!values.summary ||
      !values.context ||
      !values.challenge ||
      values.approach.length === 0 ||
      values.results.length === 0)
  ) {
    redirect("/admin/proyectos?error=case-study-required");
  }

  const db = await getDb();
  const slugOwner = (
    await db
      .select({ id: t.projects.id })
      .from(t.projects)
      .where(eq(t.projects.slug, slug))
      .limit(1)
      .all()
  )[0];
  if (slugOwner && slugOwner.id !== id) redirect("/admin/proyectos?error=slug-in-use");

  let previousSlug = "";
  if (id) {
    previousSlug =
      (
        await db
          .select({ slug: t.projects.slug })
          .from(t.projects)
          .where(eq(t.projects.id, id))
          .limit(1)
          .all()
      )[0]?.slug ?? "";
    await db.update(t.projects).set(values).where(eq(t.projects.id, id)).run();
    await audit(user.email, "actualizó", "proyecto", values.title);
  } else {
    await db.insert(t.projects).values(values).run();
    await audit(user.email, "creó", "proyecto", values.title);
  }

  refreshPublicPages([previousSlug, slug]);
  revalidatePath("/admin/proyectos");
  redirect("/admin/proyectos?saved=1");
}

export async function deleteProject(formData: FormData) {
  const user = await requireUser();
  const id = idOrThrow(formData, "/admin/proyectos");
  const db = await getDb();
  const project = (
    await db
      .select({ slug: t.projects.slug })
      .from(t.projects)
      .where(eq(t.projects.id, id))
      .limit(1)
      .all()
  )[0];
  await db.delete(t.projects).where(eq(t.projects.id, id)).run();
  await audit(user.email, "eliminó", "proyecto", `#${id}`);
  refreshPublicPages(project?.slug ? [project.slug] : []);
  revalidatePath("/admin/proyectos");
  redirect("/admin/proyectos?deleted=1");
}

// ── Experiencia ─────────────────────────────────────────────────────────────

export async function saveExperience(formData: FormData) {
  const user = await requireUser();
  const id = num(formData, "id");
  const values = {
    period: str(formData, "period"),
    role: str(formData, "role"),
    company: str(formData, "company"),
    highlights: lines(formData, "highlights"),
    sortOrder: num(formData, "sortOrder"),
  };
  if (!values.role || !values.company) {
    redirect("/admin/experiencia?error=required");
  }

  const db = await getDb();
  if (id) {
    await db.update(t.experience).set(values).where(eq(t.experience.id, id)).run();
    await audit(user.email, "actualizó", "experiencia", values.role);
  } else {
    await db.insert(t.experience).values(values).run();
    await audit(user.email, "creó", "experiencia", values.role);
  }

  refreshPublicPages();
  revalidatePath("/admin/experiencia");
  redirect("/admin/experiencia?saved=1");
}

export async function deleteExperience(formData: FormData) {
  const user = await requireUser();
  const id = idOrThrow(formData, "/admin/experiencia");
  const db = await getDb();
  await db.delete(t.experience).where(eq(t.experience.id, id)).run();
  await audit(user.email, "eliminó", "experiencia", `#${id}`);
  refreshPublicPages();
  revalidatePath("/admin/experiencia");
  redirect("/admin/experiencia?deleted=1");
}

// ── Educación ───────────────────────────────────────────────────────────────

export async function saveEducation(formData: FormData) {
  const user = await requireUser();
  const id = num(formData, "id");
  const values = {
    period: str(formData, "period"),
    degree: str(formData, "degree"),
    school: str(formData, "school"),
    note: str(formData, "note"),
    sortOrder: num(formData, "sortOrder"),
  };
  if (!values.degree) redirect("/admin/educacion?error=required");

  const db = await getDb();
  if (id) {
    await db.update(t.education).set(values).where(eq(t.education.id, id)).run();
    await audit(user.email, "actualizó", "educación", values.degree);
  } else {
    await db.insert(t.education).values(values).run();
    await audit(user.email, "creó", "educación", values.degree);
  }

  refreshPublicPages();
  revalidatePath("/admin/educacion");
  redirect("/admin/educacion?saved=1");
}

export async function deleteEducation(formData: FormData) {
  const user = await requireUser();
  const id = idOrThrow(formData, "/admin/educacion");
  const db = await getDb();
  await db.delete(t.education).where(eq(t.education.id, id)).run();
  await audit(user.email, "eliminó", "educación", `#${id}`);
  refreshPublicPages();
  revalidatePath("/admin/educacion");
  redirect("/admin/educacion?deleted=1");
}

// ── Certificaciones ─────────────────────────────────────────────────────────

export async function saveCertification(formData: FormData) {
  const user = await requireUser();
  const id = num(formData, "id");
  const name = str(formData, "name");
  const sortOrder = num(formData, "sortOrder");
  if (!name) redirect("/admin/educacion?error=required");

  const db = await getDb();
  if (id) {
    await db
      .update(t.certifications)
      .set({ name, sortOrder })
      .where(eq(t.certifications.id, id))
      .run();
    await audit(user.email, "actualizó", "certificación", name);
  } else {
    await db.insert(t.certifications).values({ name, sortOrder }).run();
    await audit(user.email, "creó", "certificación", name);
  }

  refreshPublicPages();
  revalidatePath("/admin/educacion");
  redirect("/admin/educacion?saved=1");
}

export async function deleteCertification(formData: FormData) {
  const user = await requireUser();
  const id = idOrThrow(formData, "/admin/educacion");
  const db = await getDb();
  await db.delete(t.certifications).where(eq(t.certifications.id, id)).run();
  await audit(user.email, "eliminó", "certificación", `#${id}`);
  refreshPublicPages();
  revalidatePath("/admin/educacion");
  redirect("/admin/educacion?deleted=1");
}

// ── Idiomas ─────────────────────────────────────────────────────────────────

export async function saveLanguage(formData: FormData) {
  const user = await requireUser();
  const id = num(formData, "id");
  const values = {
    name: str(formData, "name"),
    level: str(formData, "level"),
    sortOrder: num(formData, "sortOrder"),
  };
  if (!values.name) redirect("/admin/educacion?error=required");

  const db = await getDb();
  if (id) {
    await db.update(t.languages).set(values).where(eq(t.languages.id, id)).run();
    await audit(user.email, "actualizó", "idioma", values.name);
  } else {
    await db.insert(t.languages).values(values).run();
    await audit(user.email, "creó", "idioma", values.name);
  }

  refreshPublicPages();
  revalidatePath("/admin/educacion");
  redirect("/admin/educacion?saved=1");
}

export async function deleteLanguage(formData: FormData) {
  const user = await requireUser();
  const id = idOrThrow(formData, "/admin/educacion");
  const db = await getDb();
  await db.delete(t.languages).where(eq(t.languages.id, id)).run();
  await audit(user.email, "eliminó", "idioma", `#${id}`);
  refreshPublicPages();
  revalidatePath("/admin/educacion");
  redirect("/admin/educacion?deleted=1");
}

// ── Habilidades ─────────────────────────────────────────────────────────────

export async function saveSkill(formData: FormData) {
  const user = await requireUser();
  const id = num(formData, "id");
  const values = {
    kind: str(formData, "kind") === "area" ? "area" : "software",
    name: str(formData, "name"),
    sortOrder: num(formData, "sortOrder"),
  };
  if (!values.name) redirect("/admin/habilidades?error=required");

  const db = await getDb();
  if (id) {
    await db.update(t.skills).set(values).where(eq(t.skills.id, id)).run();
    await audit(user.email, "actualizó", "habilidad", values.name);
  } else {
    await db.insert(t.skills).values(values).run();
    await audit(user.email, "creó", "habilidad", values.name);
  }

  refreshPublicPages();
  revalidatePath("/admin/habilidades");
  redirect("/admin/habilidades?saved=1");
}

export async function deleteSkill(formData: FormData) {
  const user = await requireUser();
  const id = idOrThrow(formData, "/admin/habilidades");
  const db = await getDb();
  await db.delete(t.skills).where(eq(t.skills.id, id)).run();
  await audit(user.email, "eliminó", "habilidad", `#${id}`);
  refreshPublicPages();
  revalidatePath("/admin/habilidades");
  redirect("/admin/habilidades?deleted=1");
}
