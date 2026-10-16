import type { Metadata } from "next";
import { Portfolio } from "@/components/portfolio";
import { getExperience, getProjects, getSettings } from "@/lib/data";
import { es } from "@/lib/i18n/es";

export const revalidate = 120;
export const metadata: Metadata = {
  alternates: { canonical: "/", languages: { "es-CL": "/", en: "/en" } },
};

export default async function HomePage() {
  const [settings, projects, experience] = await Promise.all([
    getSettings(),
    getProjects(),
    getExperience(),
  ]);

  const role = settings.title ? `${settings.title} · Universidad de Concepción` : es.hero.role;

  const about = {
    eyebrow: es.about.eyebrow,
    anchor: es.about.anchor,
    cta: es.about.cta,
    heading: settings.aboutHeading || es.about.heading,
    paragraphs:
      settings.aboutParagraphs.length > 0 ? settings.aboutParagraphs : es.about.paragraphs,
  };

  const featured = projects
    .filter((project) => project.featured)
    .map((project) => ({
      id: String(project.id),
      meta: `${project.category} / ${project.year}`,
      title: project.title,
      summary: project.summary,
      tags: project.tags,
    }));

  return (
    <Portfolio
      settings={settings}
      dict={es}
      role={role}
      stats={es.stats}
      about={about}
      projects={featured}
      experience={experience.map((item) => ({
        id: item.id,
        period: item.period,
        role: item.role,
        company: item.company,
        highlight: item.highlights[0] ?? "",
      }))}
    />
  );
}
