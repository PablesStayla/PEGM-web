import { eq } from "drizzle-orm";
import {
  about,
  certifications,
  education,
  experience,
  languages,
  projects,
  sampleMessages,
  site,
  skills,
} from "@/lib/content";
import { hashPassword } from "@/lib/password";
import type { Db } from "./index";
import * as t from "./schema";

/**
 * Siembra la base de datos la primera vez que se crea (transacción atómica).
 * El contenido inicial proviene de src/lib/content.ts.
 */
export async function seedIfEmpty(db: Db): Promise<void> {
  await db.transaction(async (tx) => {
    const existing = await tx.select({ id: t.users.id }).from(t.users).limit(1).all();
    if (existing.length > 0) return;

    const email = process.env.ADMIN_EMAIL ?? "admin@pablo.cl";
    const password = process.env.ADMIN_PASSWORD ?? "admin1234";

    await tx
      .insert(t.users)
      .values({ email, name: site.name, passwordHash: hashPassword(password) })
      .run();

    await tx
      .insert(t.settings)
      .values({
        id: 1,
        name: site.name,
        title: site.title,
        tagline: site.tagline,
        location: site.location,
        email: site.email,
        linkedin: site.linkedin,
        github: site.github,
        availability: site.availability,
        aboutHeading: about.heading,
        aboutP1: about.paragraphs[0] ?? "",
        aboutP2: about.paragraphs[1] ?? "",
        aboutP3: about.paragraphs[2] ?? "",
      })
      .run();

    await tx
      .insert(t.projects)
      .values(projects.map((project, index) => ({ ...project, sortOrder: index })))
      .run();

    await tx
      .insert(t.experience)
      .values(experience.map((item, index) => ({ ...item, sortOrder: index })))
      .run();

    await tx
      .insert(t.education)
      .values(education.map((item, index) => ({ ...item, sortOrder: index })))
      .run();

    await tx
      .insert(t.certifications)
      .values(certifications.map((name, index) => ({ name, sortOrder: index })))
      .run();

    await tx
      .insert(t.skills)
      .values([
        ...skills.software.map((name, index) => ({
          kind: "software" as const,
          name,
          sortOrder: index,
        })),
        ...skills.areas.map((name, index) => ({
          kind: "area" as const,
          name,
          sortOrder: index,
        })),
      ])
      .run();

    await tx
      .insert(t.languages)
      .values(languages.map((item, index) => ({ ...item, sortOrder: index })))
      .run();

    await tx.insert(t.messages).values(sampleMessages).run();

    await tx
      .insert(t.auditLog)
      .values({
        userEmail: "sistema",
        action: "inicializó",
        entity: "base de datos",
        detail: "Contenido inicial sembrado desde src/lib/content.ts",
      })
      .run();
  });
}

/** Actualiza únicamente el nombre genérico de la semilla original. */
export async function backfillSeedIdentity(db: Db): Promise<void> {
  await db
    .update(t.settings)
    .set({ name: site.name, updatedAt: new Date() })
    .where(eq(t.settings.name, "Pablo"))
    .run();
  await db.update(t.users).set({ name: site.name }).where(eq(t.users.name, "Pablo")).run();
}

/** Completa detalles y visuales de los proyectos semilla de versiones anteriores. */
export async function backfillSeedCaseStudies(db: Db): Promise<void> {
  for (const project of projects) {
    const row = (
      await db
        .select({
          id: t.projects.id,
          slug: t.projects.slug,
          visualStyle: t.projects.visualStyle,
        })
        .from(t.projects)
        .where(eq(t.projects.title, project.title))
        .limit(1)
        .all()
    )[0];

    if (!row) continue;

    if (!row.slug) {
      await db
        .update(t.projects)
        .set({
          slug: project.slug,
          duration: project.duration,
          context: project.context,
          challenge: project.challenge,
          approach: project.approach,
          metrics: project.metrics,
          results: project.results,
          closing: project.closing,
          caseStudy: project.caseStudy,
          visualStyle: project.visualStyle,
          updatedAt: new Date(),
        })
        .where(eq(t.projects.id, row.id))
        .run();
    } else if (row.visualStyle === "process") {
      // La migración añade "process" por defecto a casos ya publicados.
      await db
        .update(t.projects)
        .set({ visualStyle: project.visualStyle })
        .where(eq(t.projects.id, row.id))
        .run();
    }
  }
}
