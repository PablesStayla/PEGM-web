import { CommandPalette, type PaletteItem } from "@/components/command-palette";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProjects, getSettings } from "@/lib/data";
import { slugify } from "@/lib/slug";

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

  return (
    <>
      <SiteHeader name={settings.name} />
      <CommandPalette items={paletteItems} />
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <main id="contenido">{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
