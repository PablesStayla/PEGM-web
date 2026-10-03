import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const lastModified = new Date();
  const pages = ["", "/cv", "/proyectos", "/laboratorio"].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
  }));
  const caseStudies = projects
    .filter((project) => project.caseStudy)
    .map((project) => ({
      url: `${SITE_URL}/proyectos/${project.slug}`,
      lastModified,
    }));

  return [...pages, ...caseStudies];
}
