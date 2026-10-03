import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { Icon, icons } from "@/components/icons";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { getProjects, getSettings, getSkills, specialities, stats, techStack } from "@/lib/data";

export const revalidate = 120;

export default async function HomePage() {
  const [settings, projects, skills] = await Promise.all([
    getSettings(),
    getProjects(),
    getSkills(),
  ]);
  const featured = projects.filter((project) => project.featured);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-32">
          <Reveal>
            <p className="text-xs font-medium tracking-[0.25em] text-accent uppercase">
              Portafolio · {settings.location}
            </p>

            <h1 className="mt-6 font-serif text-6xl tracking-tight text-balance md:text-8xl">
              {settings.name}
              <span className="text-accent">.</span>
            </h1>

            <p className="mt-4 font-serif text-2xl text-muted italic md:text-4xl">
              {settings.title}
            </p>

            <p className="mt-8 max-w-xl leading-relaxed text-muted">{settings.tagline}</p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/cv"
                className="bg-ink px-6 py-3 text-sm text-bg transition-colors hover:bg-accent"
              >
                Ver CV
              </Link>
              <Link
                href="/laboratorio"
                className="border border-line px-6 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
              >
                ⚗ Explorar el laboratorio
              </Link>
              <span className="text-sm text-muted">{settings.availability}</span>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <dl className="mt-16 grid grid-cols-1 gap-8 border-t border-line pt-8 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-serif text-3xl text-accent">{stat.value}</dt>
                  <dd className="mt-1 text-sm text-muted">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ── Quién soy ────────────────────────────────────────── */}
      <section id="sobre-mi" className="border-b border-line">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <Reveal>
            <SectionHeading label="Quién soy" title={settings.aboutHeading} />
            <div className="grid gap-10 md:grid-cols-3">
              {settings.aboutParagraphs.map((paragraph, index) => (
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
          </Reveal>
        </div>
      </section>

      {/* ── Especialidades ───────────────────────────────────── */}
      <section id="especialidades" className="border-b border-line bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <Reveal>
            <SectionHeading
              label="Especialidades"
              title="Áreas de trabajo"
              description="Seis frentes donde aporto valor técnico: desde la operación de planta hasta la modelación y la gestión de proyectos."
            />
            <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {specialities.map((item) => (
                <div key={item.title} className="bg-surface p-8">
                  <h3 className="font-serif text-lg leading-snug">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Ingeniería + código (laboratorio) ────────────────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <Reveal>
            <SectionHeading
              label="Ingeniería + código"
              title="Laboratorio digital"
              description="Construí estas herramientas interactivas para el sitio: metalurgia real programada desde cero, sin librerías de gráficos."
            />
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                href: "/laboratorio#flotacion",
                title: "Cinética de flotación",
                text: "Simulador del modelo de primer orden con curva de recuperación en tiempo real.",
              },
              {
                href: "/laboratorio#pourbaix",
                title: "Diagrama Eh-pH del cobre",
                text: "Diagrama de Pourbaix interactivo con regions de estabilidad y retícula de lectura.",
              },
              {
                href: "/laboratorio#planta",
                title: "Planta en vivo",
                text: "Instrumentación virtual con métricas operacionales actualizándose cada segundo.",
              },
            ].map((tool, index) => (
              <Reveal key={tool.href} delay={index * 100}>
                <Link
                  href={tool.href}
                  className="group flex h-full flex-col border border-line p-6 transition-colors hover:border-accent"
                >
                  <Icon path={icons.flask} className="size-5 text-accent" />
                  <h3 className="mt-4 font-serif text-lg leading-snug">{tool.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{tool.text}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium tracking-wider text-accent uppercase">
                    Probar
                    <Icon path={icons.arrowRight} className="size-3.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <ul className="mt-10 flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <li key={tech} className="border border-line px-3 py-1.5 text-xs text-muted">
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── Proyectos destacados ─────────────────────────────── */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <Reveal>
            <SectionHeading
              label="Portafolio"
              title="Casos destacados"
              description="El contexto, las decisiones y los resultados detrás de trabajos donde el análisis técnico se convirtió en impacto medible."
            />
            <div className="grid gap-6 md:grid-cols-3">
              {featured.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
            <div className="mt-10">
              <Link
                href="/proyectos"
                className="text-sm font-medium text-accent transition-colors hover:text-accent-strong"
              >
                Ver todos los casos →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Contacto ─────────────────────────────────────────── */}
      <section id="contacto">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <Reveal>
            <SectionHeading label="Contacto" title="Trabajemos juntos" />
            <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="leading-relaxed text-muted">
                  Si tienes un desafío metalúrgico, un proyecto que evaluar o un proceso que
                  optimizar, escríbeme. Los mensajes llegan directo a mi panel de administración.
                </p>
                <div className="mt-8 space-y-4 text-sm">
                  <a
                    href={`mailto:${settings.email}`}
                    className="flex items-center gap-3 text-muted transition-colors hover:text-accent"
                  >
                    <Icon path={icons.mail} className="size-4 text-accent" />
                    {settings.email}
                  </a>
                  <p className="flex items-center gap-3 text-muted">
                    <Icon path={icons.graduation} className="size-4 text-accent" />
                    {settings.location}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {skills.software.slice(0, 6).map((tech) => (
                      <span
                        key={tech}
                        className="border border-line px-2.5 py-1 text-xs text-muted"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
