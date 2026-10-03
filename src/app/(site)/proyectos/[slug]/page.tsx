import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { getProjectBySlug, getProjects, getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const revalidate = 120;

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.filter((project) => project.caseStudy).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Caso no encontrado" };

  const title = `${project.title} — Caso de estudio`;
  const url = `/proyectos/${project.slug}`;
  return {
    title,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: project.summary,
      type: "article",
      url,
    },
  };
}

function readingTime(project: NonNullable<Awaited<ReturnType<typeof getProjectBySlug>>>) {
  const text = [
    project.summary,
    project.context,
    project.challenge,
    ...project.approach,
    ...project.results,
    project.closing,
  ].join(" ");
  return Math.max(3, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200));
}

export default async function ProjectCaseStudyPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const [project, projects, settings] = await Promise.all([
    getProjectBySlug(slug),
    getProjects(),
    getSettings(),
  ]);
  if (!project) notFound();

  const published = projects.filter((item) => item.caseStudy);
  const currentIndex = published.findIndex((item) => item.id === project.id);
  const nextProject = published[(currentIndex + 1) % published.length];
  const minutes = readingTime(project);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title,
    description: project.summary,
    datePublished: project.year,
    mainEntityOfPage: `${SITE_URL}/proyectos/${project.slug}`,
    author: {
      "@type": "Person",
      name: settings.name,
      jobTitle: settings.title,
    },
    about: project.tags,
  };

  return (
    <>
      <article>
        <header className="border-b border-line">
          <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
            <Reveal>
              <nav aria-label="Migas de pan" className="text-xs text-muted">
                <Link href="/proyectos" className="transition-colors hover:text-accent">
                  Casos de estudio
                </Link>
                <span className="mx-2" aria-hidden>
                  /
                </span>
                <span>{project.category}</span>
              </nav>

              <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium tracking-[0.16em] text-accent uppercase">
                <span>{project.category}</span>
                <span className="h-px w-6 bg-line" aria-hidden />
                <span>{project.year}</span>
              </div>
              <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-[1.08] tracking-tight text-balance md:text-6xl">
                {project.title}
                <span className="text-accent">.</span>
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-relaxed text-muted md:text-xl">
                {project.summary}
              </p>

              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-line pt-6 text-sm">
                <div>
                  <dt className="text-xs tracking-wider text-muted uppercase">Duración</dt>
                  <dd className="mt-1">{project.duration || "No indicada"}</dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wider text-muted uppercase">Lectura</dt>
                  <dd className="mt-1">{minutes} min</dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wider text-muted uppercase">Disciplina</dt>
                  <dd className="mt-1">{project.category}</dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </header>

        {project.metrics.length > 0 ? (
          <section aria-label="Resultados principales" className="border-b border-line bg-surface">
            <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
              <dl className="grid gap-px border border-line bg-line sm:grid-cols-3">
                {project.metrics.map((metric) => (
                  <div key={`${metric.value}-${metric.label}`} className="bg-surface p-6 md:p-8">
                    <dt className="font-serif text-3xl tracking-tight text-accent md:text-4xl">
                      {metric.value}
                    </dt>
                    <dd className="mt-2 text-sm leading-snug text-muted">{metric.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        ) : null}

        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="space-y-16">
            <Reveal>
              <section aria-labelledby="contexto">
                <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">01</p>
                <h2 id="contexto" className="mt-3 font-serif text-3xl tracking-tight">
                  El contexto
                </h2>
                <p className="mt-6 leading-8 text-muted">{project.context}</p>
              </section>
            </Reveal>

            <Reveal>
              <section aria-labelledby="desafio">
                <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">02</p>
                <h2 id="desafio" className="mt-3 font-serif text-3xl tracking-tight">
                  El desafío
                </h2>
                <p className="mt-6 border-l-2 border-accent pl-6 text-lg leading-8">
                  {project.challenge}
                </p>
              </section>
            </Reveal>

            <Reveal>
              <section aria-labelledby="enfoque">
                <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">03</p>
                <h2 id="enfoque" className="mt-3 font-serif text-3xl tracking-tight">
                  El enfoque
                </h2>
                <ol className="mt-7 space-y-6">
                  {project.approach.map((step, index) => (
                    <li key={step} className="grid grid-cols-[2rem_1fr] gap-4">
                      <span className="flex size-8 items-center justify-center border border-accent font-serif text-sm text-accent">
                        {index + 1}
                      </span>
                      <p className="pt-0.5 leading-7 text-muted">{step}</p>
                    </li>
                  ))}
                </ol>
              </section>
            </Reveal>

            <Reveal>
              <section aria-labelledby="resultados">
                <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">04</p>
                <h2 id="resultados" className="mt-3 font-serif text-3xl tracking-tight">
                  Los resultados
                </h2>
                <ul className="mt-7 space-y-4">
                  {project.results.map((result) => (
                    <li key={result} className="flex gap-4 leading-7 text-muted">
                      <span className="mt-3 size-1.5 shrink-0 bg-accent" aria-hidden />
                      <span>{result}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>

            {project.closing ? (
              <Reveal>
                <section
                  aria-labelledby="aprendizaje"
                  className="border border-line bg-surface p-7 md:p-10"
                >
                  <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
                    Aprendizaje
                  </p>
                  <h2 id="aprendizaje" className="mt-3 font-serif text-2xl tracking-tight">
                    Lo que quedó instalado
                  </h2>
                  <p className="mt-5 leading-8 text-muted">{project.closing}</p>
                </section>
              </Reveal>
            ) : null}
          </div>

          <aside className="self-start border-t border-line pt-6 lg:sticky lg:top-24">
            <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">
              Herramientas
            </p>
            <ul className="mt-4 flex flex-wrap gap-2 lg:block lg:space-y-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="border border-line px-3 py-2 text-xs text-muted lg:border-0 lg:p-0"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-line pt-6">
              <p className="text-sm leading-relaxed text-muted">
                ¿Tienes un desafío parecido en tu operación?
              </p>
              <Link
                href="/#contacto"
                className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-strong"
              >
                Conversemos →
              </Link>
            </div>
          </aside>
        </div>
      </article>

      <nav aria-label="Más casos de estudio" className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-end sm:justify-between">
          <Link
            href="/proyectos"
            className="text-sm text-muted transition-colors hover:text-accent"
          >
            ← Todos los casos
          </Link>
          {nextProject && nextProject.id !== project.id ? (
            <Link
              href={`/proyectos/${nextProject.slug}`}
              className="group max-w-md text-left sm:text-right"
            >
              <span className="text-xs tracking-[0.16em] text-muted uppercase">Siguiente caso</span>
              <span className="mt-2 block font-serif text-xl leading-snug transition-colors group-hover:text-accent">
                {nextProject.title} →
              </span>
            </Link>
          ) : null}
        </div>
      </nav>

      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD de schema.org generado desde contenido administrado
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    </>
  );
}
