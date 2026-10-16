import type { MetadataRoute } from "next";
import { contentLastModified } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { home, cv, projects } = await contentLastModified();
  const languages = { "es-CL": SITE_URL, en: `${SITE_URL}/en` };

  return [
    { url: SITE_URL, lastModified: home, alternates: { languages } },
    { url: `${SITE_URL}/en`, lastModified: home, alternates: { languages } },
    { url: `${SITE_URL}/cv`, lastModified: cv },
    { url: `${SITE_URL}/proyectos`, lastModified: projects },
    { url: `${SITE_URL}/laboratorio` },
  ];
}
