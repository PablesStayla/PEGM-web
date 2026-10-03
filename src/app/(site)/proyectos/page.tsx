import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { getProjects } from "@/lib/data";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Casos de estudio",
  description:
    "Casos de estudio de ingeniería metalúrgica: el desafío, el método y los resultados detrás de proyectos de optimización, analítica e hidrometalurgia.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  const publishedCount = projects.filter((project) => project.caseStudy).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
      <p className="text-xs font-medium tracking-[0.25em] text-accent uppercase">Portafolio</p>
      <h1 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight text-balance md:text-6xl">
        Casos de estudio<span className="text-accent">.</span>
      </h1>
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <p className="max-w-2xl leading-relaxed text-muted">
          Del diagnóstico al resultado: una selección de desafíos reales de planta, explicados con
          su contexto, decisiones técnicas y aprendizajes. Sin revelar información confidencial de
          las operaciones.
        </p>
        <p className="text-xs tracking-[0.16em] text-muted uppercase">
          {publishedCount} {publishedCount === 1 ? "caso publicado" : "casos publicados"}
        </p>
      </div>

      <div className="mt-16 grid gap-6 border-t border-line pt-16 md:grid-cols-2">
        {projects.map((project, index) => (
          <Reveal key={project.id} delay={(index % 2) * 100}>
            <div id={project.slug} className="h-full scroll-mt-24">
              <ProjectCard project={project} index={index} />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
