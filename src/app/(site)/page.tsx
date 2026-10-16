import type { Metadata } from "next";
import { Portfolio } from "@/components/portfolio";
import { getExperience, getProjects, getSettings } from "@/lib/data";

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
  return <Portfolio settings={settings} projects={projects} experience={experience} />;
}
