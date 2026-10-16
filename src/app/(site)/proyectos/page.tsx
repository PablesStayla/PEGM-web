import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { getProjects } from "@/lib/data";
import { slugify } from "@/lib/slug";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Proyectos",
  alternates: { canonical: "/proyectos" },
  description:
    "Portafolio de proyectos de ingeniería metalúrgica: optimización de procesos, analítica de datos, hidrometalurgia y gestión de proyectos.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
      <p className="text-xs font-medium tracking-[0.25em] text-accent uppercase">Portafolio</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight md:text-6xl">
        Proyectos<span className="text-accent">.</span>
      </h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-muted">
        Investigación experimental, modelamiento CFD y desarrollo de herramientas digitales. Cada
        proyecto presenta su contexto y alcance; los trabajos en curso se identifican como tales.
      </p>

      <div className="mt-16 grid gap-6 border-t border-line pt-16 md:grid-cols-2">
        {projects.map((project, index) => (
          <Reveal key={project.id} delay={(index % 2) * 100}>
            <div id={slugify(project.title)} className="scroll-mt-24">
              <ProjectCard project={project} index={index} />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
