import type { Project } from "@/lib/content";

type ProjectCardProps = {
  project: Project;
  index: number;
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <article className="group flex h-full flex-col border border-line p-6 transition-colors hover:border-accent md:p-8">
      <div className="flex items-baseline justify-between">
        <p className="font-serif text-sm text-muted">
          {String(index + 1).padStart(2, "0")}
        </p>
        <p className="text-xs tracking-[0.15em] text-muted uppercase">
          {project.year}
        </p>
      </div>

      <p className="mt-6 text-xs font-medium tracking-[0.15em] text-accent uppercase">
        {project.category}
      </p>

      <h3 className="mt-2 font-serif text-xl leading-snug text-balance">
        {project.title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
        {project.summary}
      </p>

      <ul className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="border border-line px-2.5 py-1 text-xs text-muted"
          >
            {tag}
          </li>
        ))}
      </ul>
    </article>
  );
}
