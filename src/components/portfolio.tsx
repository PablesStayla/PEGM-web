import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { ContactForm } from "@/components/contact-form";
import { ProcessStory } from "@/components/process-story";
import { Reveal } from "@/components/reveal";
import type { SiteSettings } from "@/lib/data";
import type { AboutSection, Dictionary, FeaturedProject, Headline } from "@/lib/i18n/es";

function HeadlineBlock({ headline }: { headline: Headline }) {
  return (
    <>
      {headline.lines.map((line) => (
        <Fragment key={line}>
          {line}
          <br />
        </Fragment>
      ))}
      <em>{headline.accent}</em>
    </>
  );
}

type PortfolioProps = {
  settings: SiteSettings;
  dict: Dictionary;
  lang?: "en";
  role: string;
  stats: { value: string; label: string }[];
  about: AboutSection;
  projects: FeaturedProject[];
  experience?: Array<{
    id: number;
    period: string;
    role: string;
    company: string;
    highlight: string;
  }>;
};

export function Portfolio({
  settings,
  dict,
  lang,
  role,
  stats,
  about,
  projects,
  experience = [],
}: PortfolioProps) {
  const hero = dict.hero;

  return (
    <div className="portfolio" lang={lang}>
      <section className="portfolio-hero" aria-labelledby="intro-title">
        <div className="portfolio-container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" /> {hero.availability}
            </p>
            <p className="hero-role">{role}</p>
            <h1 id="intro-title">
              Pablo
              <br />
              Garrido<span className="copper-dot">.</span>
            </h1>
            <p className="hero-manifesto">
              <HeadlineBlock headline={hero.manifesto} />
            </p>
            <p className="hero-description">{hero.description}</p>
            <div className="hero-actions">
              <a className="portfolio-button primary" href={`#${dict.projects.anchor}`}>
                {hero.primaryCta} <span aria-hidden="true">↘</span>
              </a>
              <a className="portfolio-button" href="/cv-pablo-garrido.pdf" download>
                {hero.downloadCta} <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="hero-location">{hero.location}</p>
          </div>
          <div className="portrait-composition">
            <div className="portrait-frame">
              <Image
                src="/pablo-garrido-sin-reflejo.png"
                width={1254}
                height={1254}
                alt={hero.portraitAlt}
                preload
                sizes="(max-width: 760px) 90vw, 42vw"
                className="hero-portrait"
              />
              <span className="portrait-cross cross-top" aria-hidden="true">
                +
              </span>
              <span className="portrait-cross cross-bottom" aria-hidden="true">
                +
              </span>
            </div>
            <div className="portrait-caption">
              <span>{hero.portraitCaption[0]}</span>
              <span>{hero.portraitCaption[1]}</span>
            </div>
            <div className="portrait-note">
              <span className="eyebrow">{hero.portraitNoteEyebrow}</span>
              <p>
                <HeadlineBlock headline={hero.portraitNote} />
              </p>
            </div>
          </div>
        </div>
        <div className="portfolio-container hero-bottom">
          <a href={`#${about.anchor}`}>
            {hero.scrollHint} <span aria-hidden="true">↓</span>
          </a>
          <span>{hero.tag}</span>
        </div>
      </section>

      <section id={about.anchor} className="portfolio-about">
        <div className="portfolio-container">
          <Reveal>
            <p className="eyebrow">{about.eyebrow}</p>
            <div className="about-grid">
              {typeof about.heading === "string" ? (
                <h2>{about.heading}</h2>
              ) : (
                <h2>
                  <HeadlineBlock headline={about.heading} />
                </h2>
              )}
              <div>
                {about.paragraphs.map((paragraph, index) => (
                  <p key={paragraph} className={index === 0 ? "lead-copy" : undefined}>
                    {paragraph}
                  </p>
                ))}
                {about.cta ? (
                  <Link className="text-link" href="/cv">
                    {about.cta} <span aria-hidden="true">↗</span>
                  </Link>
                ) : null}
              </div>
            </div>
          </Reveal>
          <dl className="portfolio-stats">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt>
                  {stat.value}
                  <span aria-hidden="true">/</span>
                </dt>
                <dd>{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <ProcessStory story={dict.story} />

      <section id={dict.projects.anchor} className="portfolio-projects">
        <div className="portfolio-container">
          <Reveal>
            <div className="section-topline">
              <div>
                <p className="eyebrow">{dict.projects.eyebrow}</p>
                <h2>
                  <HeadlineBlock headline={dict.projects.heading} />
                </h2>
              </div>
              <Link className="text-link" href="/proyectos">
                {dict.projects.ctaAll} ↗
              </Link>
            </div>
          </Reveal>
          <div className="selected-projects">
            {projects.map((project, i) => (
              <Reveal key={project.id}>
                <article className="selected-project">
                  <div className={`project-art project-art-${i}`} aria-hidden="true">
                    <span className="art-index">0{i + 1}</span>
                    {i === 0 ? (
                      <div className="mineral-grains">
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>
                    ) : i === 1 ? (
                      <div className="cyclone-art">
                        <i />
                        <i />
                      </div>
                    ) : (
                      <div className="data-art">
                        <span>input</span>
                        <span>model</span>
                        <span>insight ↗</span>
                      </div>
                    )}
                    <span className="art-footnote">
                      {dict.projects.artFootnotes[i] ?? dict.projects.artFootnotes[0]}
                    </span>
                  </div>
                  <div className="project-details">
                    <p className="eyebrow">{project.meta}</p>
                    <h3>{project.title}</h3>
                    <p>{project.summary}</p>
                    <ul className="portfolio-tags">
                      {project.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <p className="technical-note">{dict.projects.footnote}</p>
        </div>
      </section>

      {dict.career.show && experience.length > 0 ? (
        <section id="trayectoria" className="portfolio-career">
          <div className="portfolio-container career-grid">
            <div className="career-intro">
              <p className="eyebrow">{dict.career.eyebrow}</p>
              <h2>
                <HeadlineBlock headline={dict.career.heading} />
              </h2>
              <p>{dict.career.intro}</p>
              <Link className="text-link" href="/cv">
                {dict.career.cta} ↗
              </Link>
            </div>
            <div>
              {experience.map((item) => (
                <Reveal key={item.id}>
                  <article className="career-entry">
                    <p className="eyebrow">{item.period}</p>
                    <h3>{item.role}</h3>
                    <p className="career-company">{item.company}</p>
                    <p>{item.highlight}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="laboratorio" className="portfolio-lab">
        <div className="portfolio-container">
          <Reveal>
            <div className="section-topline">
              <div>
                <p className="eyebrow">{dict.lab.eyebrow}</p>
                <h2>
                  {dict.lab.heading}
                  <span className="copper-dot">.</span>
                </h2>
              </div>
              <p className="lab-intro">{dict.lab.intro}</p>
            </div>
          </Reveal>
          {dict.lab.mode === "links" ? (
            <div className="lab-links">
              {(dict.lab.links ?? []).map((tool) => (
                <Link className="lab-link" key={tool.n} href={`/laboratorio#${tool.href}`}>
                  <span className="eyebrow">{tool.n}</span>
                  <span>
                    <strong>{tool.title}</strong>
                    <small>{tool.detail}</small>
                  </span>
                  <span className="lab-formula" aria-hidden="true">
                    {tool.formula}
                  </span>
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          ) : (
            <Link className="portfolio-button primary" href={dict.lab.ctaHref ?? "/laboratorio"}>
              {dict.lab.ctaLabel} ↗
            </Link>
          )}
          <p className="technical-note">{dict.lab.footnote}</p>
        </div>
      </section>

      <section id={dict.contact.id} className="portfolio-contact">
        <div className="portfolio-container contact-grid">
          <div>
            <p className="eyebrow">{dict.contact.eyebrow}</p>
            <h2>
              <HeadlineBlock headline={dict.contact.heading} />
            </h2>
            <p>{dict.contact.intro}</p>
            <a className="contact-email" href={`mailto:${settings.email}`}>
              {settings.email} <span aria-hidden="true">↗</span>
            </a>
            <div className="contact-links">
              <Link href="/cv">{dict.contact.cvLabel}</Link>
              <a href={settings.github} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
              {settings.linkedin ? (
                <a href={settings.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn ↗
                </a>
              ) : null}
            </div>
          </div>
          <div className="contact-form-panel">
            <h3>{dict.contact.panelHeading}</h3>
            {dict.contact.useForm ? (
              <ContactForm />
            ) : (
              <>
                <p>{dict.contact.panelIntro}</p>
                <a
                  className="portfolio-button primary mt-6"
                  href={`mailto:${settings.email}?subject=${encodeURIComponent(
                    dict.contact.ctaSubject ?? "",
                  )}`}
                >
                  {dict.contact.ctaLabel} ↗
                </a>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
