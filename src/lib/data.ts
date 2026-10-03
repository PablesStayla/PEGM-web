import { asc, count, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import * as t from "@/db/schema";
import {
  about,
  certifications as seedCertifications,
  education as seedEducation,
  experience as seedExperience,
  languages as seedLanguages,
  projects as seedProjects,
  skills as seedSkills,
  site,
} from "@/lib/content";
import { slugify } from "@/lib/slug";

// Contenido estático (no administrado desde el panel)
export { specialities, stats, techStack } from "@/lib/content";

/**
 * Capa de acceso a datos (libSQL local o Turso remoto).
 *
 * Las funciones públicas (get*) leen la base de datos y, si no está disponible,
 * caen al contenido semilla de src/lib/content.ts: el sitio público nunca se
 * rompe. Las funciones de administración (admin*) fallan explícitamente.
 */

// ── Tipos públicos ──────────────────────────────────────────────────────────

export type SiteSettings = {
  name: string;
  title: string;
  tagline: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  availability: string;
  aboutHeading: string;
  aboutParagraphs: string[];
};

export type PublicProject = {
  id: number;
  slug: string;
  title: string;
  category: string;
  year: string;
  summary: string;
  tags: string[];
  featured: boolean;
  duration: string;
  context: string;
  challenge: string;
  approach: string[];
  metrics: { value: string; label: string }[];
  results: string[];
  closing: string;
  caseStudy: boolean;
  sortOrder: number;
};

export type PublicExperience = {
  id: number;
  period: string;
  role: string;
  company: string;
  highlights: string[];
  sortOrder: number;
};

export type PublicEducation = {
  id: number;
  period: string;
  degree: string;
  school: string;
  note: string;
  sortOrder: number;
};

// ── Consultas públicas (con degradación elegante) ───────────────────────────

function fallbackSettings(): SiteSettings {
  return {
    ...site,
    aboutHeading: about.heading,
    aboutParagraphs: about.paragraphs,
  };
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    const db = await getDb();
    const row = (await db.select().from(t.settings).where(eq(t.settings.id, 1)).limit(1).all())[0];
    if (!row) return fallbackSettings();
    return {
      name: row.name,
      title: row.title,
      tagline: row.tagline,
      location: row.location,
      email: row.email,
      linkedin: row.linkedin,
      github: row.github,
      availability: row.availability,
      aboutHeading: row.aboutHeading,
      aboutParagraphs: [row.aboutP1, row.aboutP2, row.aboutP3].filter(Boolean),
    };
  } catch {
    return fallbackSettings();
  }
}

export async function getProjects(): Promise<PublicProject[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(t.projects)
      .orderBy(asc(t.projects.sortOrder), asc(t.projects.id))
      .all();
    if (rows.length > 0) {
      return rows.map((project) => ({
        ...project,
        // Las filas creadas antes de la migración pueden no tener slug hasta
        // que corra el backfill. El título mantiene sus enlaces utilizables.
        slug: project.slug || slugify(project.title),
      }));
    }
  } catch {
    // degradación: contenido semilla
  }
  return seedProjects.map((project, index) => ({
    ...project,
    id: index + 1,
    sortOrder: index,
  }));
}

export async function getProjectBySlug(slug: string): Promise<PublicProject | null> {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug && project.caseStudy) ?? null;
}

export async function getExperience(): Promise<PublicExperience[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(t.experience)
      .orderBy(asc(t.experience.sortOrder), asc(t.experience.id))
      .all();
    if (rows.length > 0) return rows;
  } catch {
    // degradación
  }
  return seedExperience.map((item, index) => ({
    ...item,
    id: index + 1,
    sortOrder: index,
  }));
}

export async function getEducation(): Promise<PublicEducation[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(t.education)
      .orderBy(asc(t.education.sortOrder), asc(t.education.id))
      .all();
    if (rows.length > 0) return rows;
  } catch {
    // degradación
  }
  return seedEducation.map((item, index) => ({
    ...item,
    id: index + 1,
    sortOrder: index,
  }));
}

export async function getCertifications(): Promise<string[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(t.certifications)
      .orderBy(asc(t.certifications.sortOrder), asc(t.certifications.id))
      .all();
    if (rows.length > 0) return rows.map((row) => row.name);
  } catch {
    // degradación
  }
  return seedCertifications;
}

export async function getSkills(): Promise<{
  software: string[];
  areas: string[];
}> {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(t.skills)
      .orderBy(asc(t.skills.sortOrder), asc(t.skills.id))
      .all();
    if (rows.length > 0) {
      return {
        software: rows.filter((r) => r.kind === "software").map((r) => r.name),
        areas: rows.filter((r) => r.kind === "area").map((r) => r.name),
      };
    }
  } catch {
    // degradación
  }
  return seedSkills;
}

export async function getLanguages(): Promise<{ name: string; level: string }[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(t.languages)
      .orderBy(asc(t.languages.sortOrder), asc(t.languages.id))
      .all();
    if (rows.length > 0) return rows.map((row) => ({ name: row.name, level: row.level }));
  } catch {
    // degradación
  }
  return seedLanguages;
}

// ── Consultas de administración (sin degradación) ───────────────────────────

export async function adminDashboardStats() {
  const db = await getDb();
  const [projects, experienceRows, total, read] = await Promise.all([
    db.select({ value: count() }).from(t.projects).all(),
    db.select({ value: count() }).from(t.experience).all(),
    db.select({ value: count() }).from(t.messages).all(),
    db.select({ value: count() }).from(t.messages).where(eq(t.messages.read, true)).all(),
  ]);
  return {
    projects: projects[0]?.value ?? 0,
    experience: experienceRows[0]?.value ?? 0,
    messages: total[0]?.value ?? 0,
    unreadMessages: (total[0]?.value ?? 0) - (read[0]?.value ?? 0),
    certifications:
      (await db.select({ value: count() }).from(t.certifications).all())[0]?.value ?? 0,
    skills: (await db.select({ value: count() }).from(t.skills).all())[0]?.value ?? 0,
  };
}

export async function adminRecentMessages(limit = 5) {
  const db = await getDb();
  return db.select().from(t.messages).orderBy(desc(t.messages.createdAt)).limit(limit).all();
}

export async function adminAllMessages() {
  const db = await getDb();
  return db.select().from(t.messages).orderBy(desc(t.messages.createdAt)).all();
}

export async function adminUnreadMessageCount() {
  const db = await getDb();
  const rows = await db
    .select({ value: count() })
    .from(t.messages)
    .where(eq(t.messages.read, false))
    .all();
  return rows[0]?.value ?? 0;
}

export async function adminAuditLog(limit = 50) {
  const db = await getDb();
  return db.select().from(t.auditLog).orderBy(desc(t.auditLog.createdAt)).limit(limit).all();
}

export async function adminAllProjects() {
  const db = await getDb();
  return db.select().from(t.projects).orderBy(asc(t.projects.sortOrder), asc(t.projects.id)).all();
}

export async function adminAllExperience() {
  const db = await getDb();
  return db
    .select()
    .from(t.experience)
    .orderBy(asc(t.experience.sortOrder), asc(t.experience.id))
    .all();
}

export async function adminAllEducation() {
  const db = await getDb();
  return db
    .select()
    .from(t.education)
    .orderBy(asc(t.education.sortOrder), asc(t.education.id))
    .all();
}

export async function adminAllCertifications() {
  const db = await getDb();
  return db
    .select()
    .from(t.certifications)
    .orderBy(asc(t.certifications.sortOrder), asc(t.certifications.id))
    .all();
}

export async function adminAllSkills() {
  const db = await getDb();
  return db.select().from(t.skills).orderBy(asc(t.skills.sortOrder), asc(t.skills.id)).all();
}

export async function adminAllLanguages() {
  const db = await getDb();
  return db
    .select()
    .from(t.languages)
    .orderBy(asc(t.languages.sortOrder), asc(t.languages.id))
    .all();
}

export async function adminGetSettings() {
  const db = await getDb();
  return (await db.select().from(t.settings).where(eq(t.settings.id, 1)).limit(1).all())[0];
}
