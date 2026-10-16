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

    if (sampleMessages.length > 0) {
      await tx.insert(t.messages).values(sampleMessages).run();
    }

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
