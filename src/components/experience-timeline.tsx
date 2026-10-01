import type { Experience } from "@/lib/content";

export function ExperienceTimeline({ items }: { items: Experience[] }) {
  return (
    <div className="space-y-12">
      {items.map((item) => (
        <article key={`${item.period}-${item.role}`} className="relative border-l border-line pl-8">
          <span
            aria-hidden
            className="absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full bg-accent"
          />
          <p className="text-xs font-medium tracking-[0.15em] text-muted uppercase">
            {item.period}
          </p>
          <h3 className="mt-2 font-serif text-xl leading-snug">{item.role}</h3>
          <p className="mt-1 text-sm font-medium text-accent">{item.company}</p>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
            {item.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3">
                <span aria-hidden className="mt-[0.55rem] h-px w-4 shrink-0 bg-line" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
