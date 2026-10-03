import { CommandPalette, type PaletteItem } from "@/components/command-palette";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProjects, getSettings } from "@/lib/data";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, projects] = await Promise.all([getSettings(), getProjects()]);

  const paletteItems: PaletteItem[] = [
    { group: "Páginas", label: "Inicio", href: "/" },
    { group: "Páginas", label: "CV", href: "/cv" },
    { group: "Páginas", label: "Proyectos", href: "/proyectos" },
    { group: "Páginas", label: "Laboratorio", href: "/laboratorio" },
    { group: "Páginas", label: "Privacidad", href: "/privacidad" },
    {
      group: "Laboratorio",
      label: "Simulador de cinética de flotación",
      href: "/laboratorio#flotacion",
    },
    {
      group: "Laboratorio",
      label: "Balance de masa (dos productos)",
      href: "/laboratorio#balance",
    },
    {
      group: "Laboratorio",
      label: "Diagrama Eh-pH del cobre",
      href: "/laboratorio#pourbaix",
    },
    {
      group: "Laboratorio",
      label: "Planta en vivo (instrumentación virtual)",
      href: "/laboratorio#planta",
    },
    { group: "Secciones", label: "Sobre mí", href: "/#sobre-mi" },
    { group: "Secciones", label: "Especialidades", href: "/#especialidades" },
    { group: "Secciones", label: "Contacto", href: "/#contacto" },
    ...projects.map((project) => ({
      group: "Casos de estudio",
      label: project.title,
      href: project.caseStudy ? `/proyectos/${project.slug}` : `/proyectos#${project.slug}`,
    })),
    {
      group: "Administración",
      label: "Panel de administración",
      href: "/admin",
    },
  ];

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.name,
    jobTitle: settings.title,
    description: settings.tagline,
    email: `mailto:${settings.email}`,
    url: settings.linkedin,
    address: {
      "@type": "PostalAddress",
      addressLocality: settings.location,
      addressCountry: "CL",
    },
    knowsAbout: [
      "Metalurgia extractiva",
      "Procesamiento de minerales",
      "Hidrometalurgia",
      "Pirometalurgia",
    ],
  };

  return (
    <>
      <SiteHeader name={settings.name} />
      <CommandPalette items={paletteItems} />
      <main id="contenido-principal" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter settings={settings} />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD de schema.org generado desde datos propios
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
    </>
  );
}
