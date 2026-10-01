import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://pablo-ejemplo.vercel.app"; // ← reemplazar por tu dominio

  return ["", "/cv", "/proyectos", "/laboratorio"].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
}
