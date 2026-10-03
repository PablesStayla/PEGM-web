import Link from "next/link";
import { ProjectVisualThumbnail } from "@/components/project-visual";
import type { PublicProject } from "@/lib/data";

type ProjectCardProps = {
  project: PublicProject;
  index: number;
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  const href = `/proyectos/${project.slug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden border border-line bg-bg p-6 transition-all duration-500 hover:-translate-y-2 hover:border-accent hover:shadow-2xl hover:shadow-ink/10 md:p-8">
      <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100" />
      <div className="flex items-baseline justify-between">
        <p className="font-serif text-sm text-muted">{String(index + 1).padStart(2, "0")}</p>
        <p className="text-xs tracking-[0.15em] text-muted uppercase">{project.year}</p>
      </div>

      <div className="mt-6 overflow-hidden">
        <div className="transition-transform duration-700 ease-out group-hover:scale-[1.04]">
          <ProjectVisualThumbnail style={project.visualStyle} />
        </div>
      </div>

      <p className="mt-5 text-xs font-medium tracking-[0.15em] text-accent uppercase">
        {project.category}
      </p>

      <h3 className="mt-2 font-serif text-xl leading-snug text-balance">
        {project.caseStudy ? (
          <Link href={href} className="transition-colors group-hover:text-accent">
            {project.title}
          </Link>
        ) : (
          project.title
        )}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{project.summary}</p>

      <ul className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li key={tag} className="border border-line px-2.5 py-1 text-xs text-muted">
            {tag}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-4">
        {project.caseStudy ? (
          <Link
            href={href}
            aria-label={`Leer caso de estudio: ${project.title}`}
            className="text-xs font-medium tracking-[0.12em] text-accent uppercase transition-colors hover:text-accent-strong"
          >
            Leer caso <span aria-hidden>→</span>
          </Link>
        ) : (
          <p className="text-[10px] tracking-[0.16em] text-muted uppercase">Ficha de proyecto</p>
        )}
        {project.featured ? (
          <p className="text-[10px] font-medium tracking-[0.18em] text-accent uppercase">
            ★ Destacado
          </p>
        ) : null}
      </div>
    </article>
  );
}
