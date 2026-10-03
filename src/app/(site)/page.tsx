import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { ExperimentalHero } from "@/components/experimental-hero";
import { Icon, icons } from "@/components/icons";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { getProjects, getSettings, getSkills, specialities, stats, techStack } from "@/lib/data";

export const revalidate = 120;

const labTools = [
  {
    href: "/laboratorio#flotacion",
    number: "01",
    title: "Cinética de flotación",
    text: "Simulador del modelo de primer orden con curva de recuperación en tiempo real.",
    wave: "M4 42C28 42 30 12 54 12s26 30 50 30 27-22 48-22 23 22 52 22",
  },
  {
    href: "/laboratorio#pourbaix",
    number: "02",
    title: "Diagrama Eh-pH del cobre",
    text: "Regiones de estabilidad, fronteras de Nernst y lectura interactiva de especies.",
    wave: "M4 45 42 45 72 15 108 15 137 34 177 34 205 8 231 8",
  },
  {
    href: "/laboratorio#planta",
    number: "03",
    title: "Planta en vivo",
    text: "Instrumentación virtual con métricas operacionales actualizándose cada segundo.",
    wave: "M4 39 30 39 43 25 56 51 77 9 97 42 116 31 136 44 157 17 182 41 231 41",
  },
];

export default async function HomePage() {
  const [settings, projects, skills] = await Promise.all([
    getSettings(),
    getProjects(),
    getSkills(),
  ]);
  const featured = projects.filter((project) => project.featured);
  const stripItems = [
    "Procesamiento de minerales",
    "Optimización operacional",
    "Modelación metalúrgica",
    "Datos que deciden",
    "Ingeniería aplicada",
  ];
  const loopingStripItems = [
    ...stripItems.map((label) => ({ label, copy: "a" })),
    ...stripItems.map((label) => ({ label, copy: "b" })),
  ];

  return (
    <>
      <ExperimentalHero
        name={settings.name}
        title={settings.title}
        tagline={settings.tagline}
        location={settings.location}
        availability={settings.availability}
        stats={stats}
      />

      <div className="kinetic-strip" aria-hidden>
        <div className="kinetic-strip-track">
          {loopingStripItems.map((item) => (
            <span key={`${item.copy}-${item.label}`} className="kinetic-strip-item">
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Perfil ───────────────────────────────────────────── */}
      <section id="sobre-mi" className="border-b border-line">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 md:py-36 lg:grid-cols-[0.42fr_1fr] lg:px-10">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="text-xs font-medium tracking-[0.22em] text-accent uppercase">
                Quién soy
              </p>
              <p className="home-index mt-8" aria-hidden>
                01
              </p>
              <p className="mt-8 max-w-xs text-xs leading-relaxed tracking-wide text-muted uppercase">
                Ingeniería que conecta la lectura del mineral con la decisión de planta.
              </p>
            </Reveal>
          </div>

          <div>
            <Reveal>
              <h2 className="max-w-4xl font-serif text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-7xl">
                {settings.aboutHeading}
                <span className="text-accent"> — sin separar el dato de la operación.</span>
              </h2>
            </Reveal>
            <div className="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
              {settings.aboutParagraphs.map((paragraph, index) => (
                <Reveal key={paragraph.slice(0, 24)} delay={index * 120}>
                  <div className="h-full bg-bg p-7 transition-colors duration-500 hover:bg-surface md:p-8">
                    <p className="font-serif text-sm text-accent">0{index + 1}</p>
                    <p
                      className={`mt-8 leading-relaxed ${
                        index === 0 ? "text-base text-ink" : "text-sm text-muted"
                      }`}
                    >
                      {paragraph}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Especialidades ───────────────────────────────────── */}
      <section id="especialidades" className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-36 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.35fr] lg:items-end">
            <Reveal>
              <SectionHeading
                label="Especialidades · 02"
                title="Seis frentes. Una sola lectura del proceso."
                description="Desde la operación de planta hasta la modelación y la gestión de proyectos: cada disciplina se conecta con una decisión medible."
              />
            </Reveal>
            <Reveal delay={120}>
              <p className="mb-10 text-sm leading-relaxed text-muted lg:text-right">
                Pase el cursor para explorar cada área de intervención.
              </p>
            </Reveal>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {specialities.map((item, index) => (
              <Reveal
                key={item.title}
                delay={(index % 3) * 90}
                className={index === 0 || index === 5 ? "lg:col-span-2" : ""}
              >
                <article className="speciality-card group flex h-full flex-col justify-between p-7 md:p-9">
                  <div className="flex items-start justify-between gap-6">
                    <p className="speciality-number font-serif text-sm text-muted transition-colors">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <span className="text-accent transition-transform duration-500 group-hover:rotate-45">
                      ↗
                    </span>
                  </div>
                  <div className="mt-16 max-w-xl">
                    <h3 className="font-serif text-2xl leading-tight md:text-3xl">{item.title}</h3>
                    <p className="speciality-description mt-4 max-w-lg text-sm leading-relaxed text-muted transition-colors">
                      {item.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ingeniería + código ──────────────────────────────── */}
      <section className="lab-showcase border-b border-[#332a23]">
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-36 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.38fr_1fr]">
            <Reveal>
              <div>
                <p className="text-xs font-medium tracking-[0.22em] text-[#d08a55] uppercase">
                  Ingeniería + código
                </p>
                <p
                  className="mt-8 font-serif text-[clamp(5rem,10vw,9rem)] leading-none text-white/8"
                  aria-hidden
                >
                  03
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div>
                <h2 className="max-w-4xl font-serif text-4xl leading-[1.04] tracking-tight text-balance sm:text-5xl lg:text-7xl">
                  Laboratorio <span className="text-[#d08a55] italic">digital.</span>
                </h2>
                <p className="mt-6 max-w-2xl leading-relaxed text-[#a89e91]">
                  Metalurgia real programada desde cero. Modelos vivos para experimentar, leer el
                  proceso y convertir ecuaciones en intuición operacional.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {labTools.map((tool, index) => (
              <Reveal key={tool.href} delay={index * 120}>
                <Link
                  href={tool.href}
                  className="lab-card-dynamic group flex h-full flex-col p-6 md:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm text-[#d08a55]">{tool.number}</span>
                    <Icon
                      path={icons.arrowRight}
                      className="size-4 text-[#d08a55] transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                  <svg viewBox="0 0 235 60" className="mt-10 w-full" aria-hidden>
                    <path d="M3 52H232" stroke="rgb(255 255 255 / 12%)" />
                    <path
                      d={tool.wave}
                      className="lab-wave"
                      fill="none"
                      stroke="#d08a55"
                      strokeWidth="2"
                    />
                  </svg>
                  <h3 className="mt-9 font-serif text-2xl leading-snug">{tool.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[#a89e91]">{tool.text}</p>
                  <span className="mt-8 text-[10px] font-semibold tracking-[0.18em] text-[#d08a55] uppercase">
                    Abrir experimento
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <ul className="mt-12 flex flex-wrap gap-2 border-t border-white/10 pt-8">
              {techStack.map((tech) => (
                <li
                  key={tech}
                  className="border border-white/15 px-3 py-1.5 text-xs text-[#a89e91]"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── Casos ────────────────────────────────────────────── */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-36 lg:px-10">
          <Reveal>
            <div className="mb-14 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                label="Portafolio · 04"
                title="Casos destacados"
                description="El contexto, las decisiones y los resultados detrás de trabajos donde el análisis técnico se convirtió en impacto medible."
              />
              <Link
                href="/proyectos"
                className="group mb-10 inline-flex items-center gap-3 text-sm font-medium text-accent"
              >
                Ver todos los casos
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-2">
            {featured.map((project, index) => (
              <Reveal key={project.id} delay={index * 130}>
                <ProjectCard project={project} index={index} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contacto ─────────────────────────────────────────── */}
      <section id="contacto" className="contact-stage">
        <span className="contact-word" aria-hidden>
          HABLEMOS
        </span>
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-36 lg:px-10">
          <Reveal>
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="text-xs font-medium tracking-[0.22em] text-accent uppercase">
                  Contacto · 05
                </p>
                <h2 className="mt-5 font-serif text-5xl leading-[0.95] tracking-tight md:text-7xl">
                  Un desafío real merece una conversación directa
                  <span className="text-accent">.</span>
                </h2>
                <p className="mt-8 max-w-lg leading-relaxed text-muted">
                  Si tienes un proceso que optimizar, un proyecto que evaluar o datos que todavía no
                  se convierten en decisiones, escríbeme.
                </p>
                <div className="mt-10 space-y-4 text-sm">
                  <a
                    href={`mailto:${settings.email}`}
                    className="group flex items-center gap-3 text-muted transition-colors hover:text-accent"
                  >
                    <span className="flex size-9 items-center justify-center border border-line transition-colors group-hover:border-accent">
                      <Icon path={icons.mail} className="size-4 text-accent" />
                    </span>
                    {settings.email}
                  </a>
                  <p className="flex items-center gap-3 text-muted">
                    <span className="flex size-9 items-center justify-center border border-line">
                      <Icon path={icons.graduation} className="size-4 text-accent" />
                    </span>
                    {settings.location}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-4">
                    {skills.software.slice(0, 6).map((tech) => (
                      <span
                        key={tech}
                        className="border border-line bg-bg/70 px-2.5 py-1 text-xs text-muted"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-line bg-bg/90 p-6 shadow-2xl shadow-ink/5 backdrop-blur-sm md:p-9">
                <p className="mb-7 text-xs font-medium tracking-[0.18em] text-muted uppercase">
                  Iniciar conversación
                </p>
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
