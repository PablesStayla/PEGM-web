import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Proyectos",
  description:
    "Portafolio de proyectos de ingeniería metalúrgica: optimización de procesos, analítica de datos, hidrometalurgia y gestión de proyectos.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
      <p className="text-xs font-medium tracking-[0.25em] text-accent uppercase">
        Portafolio
      </p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight md:text-6xl">
        Proyectos<span className="text-accent">.</span>
      </h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-muted">
        Trabajos seleccionados donde apliqué ingeniería metalúrgica y análisis
        de datos para resolver problemas reales de la operación. Cada proyecto
        parte de una pregunta de planta y termina en un resultado medible.
      </p>

      <div className="mt-16 grid gap-6 border-t border-line pt-16 md:grid-cols-2">
        {projects.map((project, index) => (
          <ProjectCard key={project.title} project={project} index={index} />
        ))}
      </div>
    </div>
  );
}
