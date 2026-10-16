import { asc, count, desc, eq, max } from "drizzle-orm";
import { cache } from "react";
import { type Db, getDb } from "@/db";
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
import { quiet } from "@/lib/log";

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
  title: string;
  category: string;
  year: string;
  summary: string;
  tags: string[];
  featured: boolean;
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

export const getSettings = cache(async (): Promise<SiteSettings> => {
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
  } catch (error) {
    quiet(error, "getSettings");
    return fallbackSettings();
  }
});

export const getProjects = cache(async (): Promise<PublicProject[]> => {
  try {
    const db = await getDb();
    const rows = await getProjectsFromDb(db);
    if (rows.length > 0) return rows;
    return []; // tabla correctamente vacía: resultado válido, no semilla
  } catch (error) {
    quiet(error, "getProjects");
    return seedProjects.map((project, index) => ({
      ...project,
      id: index + 1,
      sortOrder: index,
    })); // BD no disponible: degradación elegante (sitio no se rompe)
  }
});

/** Consulta de proyectos sin caché: inyectable para pruebas. */
export async function getProjectsFromDb(db: Db): Promise<PublicProject[]> {
  return db.select().from(t.projects).orderBy(asc(t.projects.sortOrder), asc(t.projects.id)).all();
}

export const getExperience = cache(async (): Promise<PublicExperience[]> => {
  try {
    const db = await getDb();
    const rows = await getExperienceFromDb(db);
    if (rows.length > 0) return rows;
    return []; // tabla correctamente vacía: resultado válido, no semilla
  } catch (error) {
    quiet(error, "getExperience");
    return seedExperience.map((item, index) => ({
      ...item,
      id: index + 1,
      sortOrder: index,
    })); // BD no disponible: degradación elegante (sitio no se rompe)
  }
});

/** Consulta de experiencia sin caché: inyectable para pruebas. */
export async function getExperienceFromDb(db: Db): Promise<PublicExperience[]> {
  return db
    .select()
    .from(t.experience)
    .orderBy(asc(t.experience.sortOrder), asc(t.experience.id))
    .all();
}

export const getEducation = cache(async (): Promise<PublicEducation[]> => {
  try {
    const db = await getDb();
    const rows = await getEducationFromDb(db);
    if (rows.length > 0) return rows;
    return []; // tabla correctamente vacía: resultado válido, no semilla
  } catch (error) {
    quiet(error, "getEducation");
    return seedEducation.map((item, index) => ({
      ...item,
      id: index + 1,
      sortOrder: index,
    })); // BD no disponible: degradación elegante (sitio no se rompe)
  }
});

/** Consulta de educación sin caché: inyectable para pruebas. */
export async function getEducationFromDb(db: Db): Promise<PublicEducation[]> {
  return db
    .select()
    .from(t.education)
    .orderBy(asc(t.education.sortOrder), asc(t.education.id))
    .all();
}

export const getCertifications = cache(async (): Promise<string[]> => {
  try {
    const db = await getDb();
    const rows = await getCertificationsFromDb(db);
    if (rows.length > 0) return rows.map((row) => row.name);
    return []; // tabla correctamente vacía: resultado válido, no semilla
  } catch (error) {
    quiet(error, "getCertifications");
    return seedCertifications; // BD no disponible: degradación elegante (sitio no se rompe)
  }
});

/** Consulta de certificaciones sin caché: inyectable para pruebas. */
export async function getCertificationsFromDb(db: Db): Promise<{ name: string }[]> {
  return db
    .select()
    .from(t.certifications)
    .orderBy(asc(t.certifications.sortOrder), asc(t.certifications.id))
    .all();
}

export const getSkills = cache(
  async (): Promise<{
    software: string[];
    areas: string[];
  }> => {
    try {
      const db = await getDb();
      const rows = await getSkillsFromDb(db);
      if (rows.length > 0) {
        return {
          software: rows.filter((r) => r.kind === "software").map((r) => r.name),
          areas: rows.filter((r) => r.kind === "area").map((r) => r.name),
        };
      }
      return { software: [], areas: [] }; // tabla correctamente vacía: resultado válido, no semilla
    } catch (error) {
      quiet(error, "getSkills");
      return seedSkills; // BD no disponible: degradación elegante (sitio no se rompe)
    }
  },
);

/** Consulta de skills sin caché: inyectable para pruebas. */
export async function getSkillsFromDb(db: Db): Promise<{ kind: string; name: string }[]> {
  return db.select().from(t.skills).orderBy(asc(t.skills.sortOrder), asc(t.skills.id)).all();
}

export const getLanguages = cache(async (): Promise<{ name: string; level: string }[]> => {
  try {
    const db = await getDb();
    const rows = await getLanguagesFromDb(db);
    if (rows.length > 0) return rows.map((row) => ({ name: row.name, level: row.level }));
    return []; // tabla correctamente vacía: resultado válido, no semilla
  } catch (error) {
    quiet(error, "getLanguages");
    return seedLanguages; // BD no disponible: degradación elegante (sitio no se rompe)
  }
});

/** Consulta de idiomas sin caché: inyectable para pruebas. */
export async function getLanguagesFromDb(db: Db): Promise<{ name: string; level: string }[]> {
  return db
    .select()
    .from(t.languages)
    .orderBy(asc(t.languages.sortOrder), asc(t.languages.id))
    .all();
}

/** Última modificación real por zona del sitio (undefined si la BD no responde). */
export const contentLastModified = cache(
  async (): Promise<{
    home?: Date;
    cv?: Date;
    projects?: Date;
  }> => {
    try {
      const db = await getDb();
      const settingsRow = (
        await db
          .select({ updatedAt: t.settings.updatedAt })
          .from(t.settings)
          .where(eq(t.settings.id, 1))
          .limit(1)
          .all()
      )[0];
      const projectsMax = (
        await db
          .select({ value: max(t.projects.updatedAt) })
          .from(t.projects)
          .all()
      )[0]?.value;
      if (!settingsRow && !projectsMax) return {};
      return {
        home: settingsRow?.updatedAt,
        cv: settingsRow?.updatedAt,
        projects: projectsMax ?? settingsRow?.updatedAt,
      };
    } catch (error) {
      quiet(error, "contentLastModified");
      return {};
    }
  },
);

// ── Consultas de administración (sin degradación) ───────────────────────────

export async function adminSessionEpoch(email: string): Promise<number | null> {
  const db = await getDb();
  const row = (
    await db
      .select({ epoch: t.users.sessionEpoch })
      .from(t.users)
      .where(eq(t.users.email, email))
      .limit(1)
      .all()
  )[0];
  return row ? row.epoch : null;
}

export async function adminDashboardStats() {
  const db = await getDb();
  const [projects, experienceRows, total, read, certifications, skills] = await Promise.all([
    db.select({ value: count() }).from(t.projects).all(),
    db.select({ value: count() }).from(t.experience).all(),
    db.select({ value: count() }).from(t.messages).all(),
    db.select({ value: count() }).from(t.messages).where(eq(t.messages.read, true)).all(),
    db.select({ value: count() }).from(t.certifications).all(),
    db.select({ value: count() }).from(t.skills).all(),
  ]);
  return {
    projects: projects[0]?.value ?? 0,
    experience: experienceRows[0]?.value ?? 0,
    messages: total[0]?.value ?? 0,
    unreadMessages: (total[0]?.value ?? 0) - (read[0]?.value ?? 0),
    certifications: certifications[0]?.value ?? 0,
    skills: skills[0]?.value ?? 0,
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

export async function adminAuditLog({
  page = 1,
  action = "",
}: {
  page?: number;
  action?: string;
} = {}) {
  const db = await getDb();
  const perPage = 25;
  const where = action ? eq(t.auditLog.action, action) : undefined;

  const total =
    (await db.select({ value: count() }).from(t.auditLog).where(where).all())[0]?.value ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pageCount);

  const rows = await db
    .select()
    .from(t.auditLog)
    .where(where)
    .orderBy(desc(t.auditLog.createdAt))
    .limit(perPage)
    .offset((current - 1) * perPage)
    .all();

  return { rows, total, page: current, pageCount };
}

export async function adminDistinctAuditActions(): Promise<string[]> {
  const db = await getDb();
  const rows = await db
    .selectDistinct({ action: t.auditLog.action })
    .from(t.auditLog)
    .orderBy(asc(t.auditLog.action))
    .all();
  return rows.map((row) => row.action);
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
