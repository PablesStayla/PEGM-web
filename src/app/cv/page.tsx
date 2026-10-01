import type { Metadata } from "next";
import { ExperienceTimeline } from "@/components/experience-timeline";
import {
  certifications,
  education,
  experience,
  languages,
  site,
  skills,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "CV",
  description:
    "Experiencia profesional, formación, certificaciones y habilidades de Pablo, Ingeniero Civil Metalúrgico.",
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
        {title}
      </h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function CvPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
      {/* ── Encabezado ─────────────────────────────────────── */}
      <p className="text-xs font-medium tracking-[0.25em] text-accent uppercase">
        Currículum
      </p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight md:text-6xl">
        CV<span className="text-accent">.</span>
      </h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-muted">
        {site.tagline} {site.availability.toLowerCase()}.
      </p>
      <a
        href={`mailto:${site.email}?subject=Solicitud%20de%20CV%20(PDF)`}
        className="mt-8 inline-block border border-line px-6 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
      >
        Solicitar versión PDF
      </a>

      <div className="mt-16 grid gap-16 border-t border-line pt-16 lg:grid-cols-[1.6fr_1fr]">
        {/* ── Columna principal ────────────────────────────── */}
        <Block title="Experiencia">
          <ExperienceTimeline items={experience} />
        </Block>

        {/* ── Columna lateral ──────────────────────────────── */}
        <div className="space-y-14">
          <Block title="Educación">
            <div className="space-y-8">
              {education.map((item) => (
                <div key={item.degree}>
                  <p className="text-xs tracking-[0.15em] text-muted uppercase">
                    {item.period}
                  </p>
                  <h4 className="mt-2 font-serif text-lg leading-snug">
                    {item.degree}
                  </h4>
                  <p className="mt-1 text-sm text-muted">{item.school}</p>
                  {item.note ? (
                    <p className="mt-1 text-sm text-muted">{item.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </Block>

          <Block title="Certificaciones y cursos">
            <ul className="space-y-3 text-sm text-muted">
              {certifications.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-[0.55rem] h-px w-4 shrink-0 bg-line"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Block>

          <Block title="Software y herramientas">
            <ul className="flex flex-wrap gap-2">
              {skills.software.map((skill) => (
                <li
                  key={skill}
                  className="border border-line px-3 py-1.5 text-xs text-muted"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </Block>

          <Block title="Áreas técnicas">
            <ul className="space-y-2 text-sm text-muted">
              {skills.areas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </Block>

          <Block title="Idiomas">
            <ul className="space-y-2 text-sm text-muted">
              {languages.map((language) => (
                <li key={language.name} className="flex justify-between gap-4">
                  <span>{language.name}</span>
                  <span className="text-ink">{language.level}</span>
                </li>
              ))}
            </ul>
          </Block>
        </div>
      </div>
    </div>
  );
}
