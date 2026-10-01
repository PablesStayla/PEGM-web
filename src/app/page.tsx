import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { ProjectCard } from "@/components/project-card";
import {
  about,
  contact,
  projects,
  site,
  specialities,
  stats,
} from "@/lib/content";

export default function HomePage() {
  const featured = projects.filter((project) => project.featured);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-32">
          <p className="text-xs font-medium tracking-[0.25em] text-accent uppercase">
            Portafolio · {site.location}
          </p>

          <h1 className="mt-6 font-serif text-6xl tracking-tight text-balance md:text-8xl">
            {site.name}
            <span className="text-accent">.</span>
          </h1>

          <p className="mt-4 font-serif text-2xl text-italic text-muted italic md:text-4xl">
            {site.title}
          </p>

          <p className="mt-8 max-w-xl leading-relaxed text-muted">
            {site.tagline}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/cv"
              className="bg-ink px-6 py-3 text-sm text-bg transition-colors hover:bg-accent"
            >
              Ver CV
            </Link>
            <Link
              href="/proyectos"
              className="border border-line px-6 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              Proyectos
            </Link>
            <span className="text-sm text-muted">{site.availability}</span>
          </div>

          <dl className="mt-16 grid grid-cols-1 gap-8 border-t border-line pt-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-serif text-3xl text-accent">{stat.value}</dt>
                <dd className="mt-1 text-sm text-muted">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Quién soy ────────────────────────────────────────── */}
      <section id="sobre-mi" className="border-b border-line">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <SectionHeading label={about.label} title={about.heading} />
          <div className="grid gap-10 md:grid-cols-3">
            {about.paragraphs.map((paragraph, index) => (
              <p
                key={paragraph.slice(0, 24)}
                className={`leading-relaxed text-muted ${
                  index === 0 ? "md:text-ink" : "text-sm"
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Especialidades ───────────────────────────────────── */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <SectionHeading
            label="Especialidades"
            title="Áreas de trabajo"
            description="Seis frentes donde aporto valor técnico: desde la operación de planta hasta la modelación y la gestión de proyectos."
          />
          <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {specialities.map((item) => (
              <div key={item.title} className="bg-surface p-8">
                <h3 className="font-serif text-lg leading-snug">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Proyectos destacados ─────────────────────────────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <SectionHeading
            label="Portafolio"
            title="Proyectos destacados"
            description="Una selección de trabajos donde el análisis técnico se tradujo en resultados medibles."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((project, index) => (
              <ProjectCard key={project.title} project={project} index={index} />
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/proyectos"
              className="text-sm font-medium text-accent transition-colors hover:text-accent-strong"
            >
              Ver todos los proyectos →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contacto ─────────────────────────────────────────── */}
      <section id="contacto">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <SectionHeading label={contact.label} title={contact.heading} />
          <p className="max-w-xl leading-relaxed text-muted">{contact.text}</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <a
              href={`mailto:${site.email}`}
              className="bg-ink px-6 py-3 text-sm text-bg transition-colors hover:bg-accent"
            >
              {contact.cta}
            </a>
            <p className="text-sm text-muted">
              {contact.secondary}{" "}
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
              >
                LinkedIn
              </a>{" "}
              o{" "}
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
