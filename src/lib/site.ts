/**
 * URL pública del sitio, compartida por sitemap, robots, metadataBase y el
 * JSON-LD. En producción definir NEXT_PUBLIC_SITE_URL (ver DEPLOY.md);
 * sin ella se usa el valor de desarrollo.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);
