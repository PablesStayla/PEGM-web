import { site } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Resumen del sitio para asistentes de IA (llms.txt).
 * Estático a propósito: sin BD ni datos por request.
 */
export function GET() {
  const body = [
    `# ${site.name} — ${site.title}`,
    "",
    `> ${site.tagline}`,
    "",
    "## Páginas",
    "",
    `- [Portada (es)](${SITE_URL}/): identidad, enfoque, proyectos destacados, laboratorio y contacto.`,
    `- [Home (en)](${SITE_URL}/en): versión en inglés de la portada.`,
    `- [CV](${SITE_URL}/cv): experiencia, educación, certificaciones, software y áreas técnicas.`,
    `- [Proyectos](${SITE_URL}/proyectos): portafolio completo de proyectos de ingeniería.`,
    `- [Laboratorio](${SITE_URL}/laboratorio): simuladores didácticos (flotación, balance de masa, Eh-pH, planta en vivo).`,
    "",
    "## Contacto",
    "",
    `- Correo: ${site.email}`,
    `- GitHub: ${site.github}`,
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
