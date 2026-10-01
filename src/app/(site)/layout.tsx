import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  CommandPalette,
  type PaletteItem,
} from "@/components/command-palette";
import { getProjects, getSettings } from "@/lib/data";
import { slugify } from "@/lib/slug";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, projects] = await Promise.all([
    getSettings(),
    getProjects(),
  ]);

  const paletteItems: PaletteItem[] = [
    { group: "Páginas", label: "Inicio", href: "/" },
    { group: "Páginas", label: "CV", href: "/cv" },
    { group: "Páginas", label: "Proyectos", href: "/proyectos" },
    { group: "Páginas", label: "Laboratorio", href: "/laboratorio" },
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
      group: "Proyectos",
      label: project.title,
      href: `/proyectos#${slugify(project.title)}`,
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
      <main>{children}</main>
      <SiteFooter settings={settings} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
    </>
  );
}
