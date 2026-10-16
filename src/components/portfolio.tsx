import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { ProcessStory } from "@/components/process-story";
import { Reveal } from "@/components/reveal";
import { stats } from "@/lib/content";
import type { PublicExperience, PublicProject, SiteSettings } from "@/lib/data";

export function Portfolio({
  settings,
  projects,
  experience,
}: {
  settings: SiteSettings;
  projects: PublicProject[];
  experience: PublicExperience[];
}) {
  return (
    <div className="portfolio">
      <section className="portfolio-hero" aria-labelledby="intro-title">
        <div className="portfolio-container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" /> Abierto a oportunidades
            </p>
            <p className="hero-role">
              {settings.title
                ? `${settings.title} · Universidad de Concepción`
                : "Ingeniero Civil Metalúrgico · Universidad de Concepción"}
            </p>
            <h1 id="intro-title">
              Pablo
              <br />
              Garrido<span className="copper-dot">.</span>
            </h1>
            <p className="hero-manifesto">
              Comprender el proceso.
              <br />
              <em>Transformar la decisión.</em>
            </p>
            <p className="hero-description">
              Conecto metalurgia, simulación y datos para abordar desafíos de ingeniería. De la
              evidencia experimental al modelo; del modelo a una decisión trazable.
            </p>
            <div className="hero-actions">
              <a className="portfolio-button primary" href="#proyectos">
                Explorar mi trabajo <span aria-hidden="true">↘</span>
              </a>
              <a className="portfolio-button" href="/cv-pablo-garrido.pdf" download>
                Descargar CV <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="hero-location">
              Concepción, Chile <span aria-hidden="true">—</span> Movilidad nacional
            </p>
          </div>
          <div className="portrait-composition">
            <div className="portrait-frame">
              <Image
                src="/pablo-garrido-sin-reflejo.png"
                width={1254}
                height={1254}
                alt="Pablo Garrido, Ingeniero Civil Metalúrgico"
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
              <span>INGENIERÍA CON FUNDAMENTO</span>
              <span>36°49′ S · 73°03′ O</span>
            </div>
            <div className="portrait-note">
              <span className="eyebrow">Foco profesional</span>
              <p>
                Procesos.
                <br />
                Simulación.
                <br />
                <em>Datos.</em>
              </p>
            </div>
          </div>
        </div>
        <div className="portfolio-container hero-bottom">
          <a href="#sobre-mi">
            Baja para conocer mi enfoque <span aria-hidden="true">↓</span>
          </a>
          <span>PORTAFOLIO / 2026</span>
        </div>
      </section>

      <section id="sobre-mi" className="portfolio-about">
        <div className="portfolio-container">
          <Reveal>
            <p className="eyebrow">01 / El enfoque</p>
            <div className="about-grid">
              {settings.aboutHeading ? (
                <h2>{settings.aboutHeading}</h2>
              ) : (
                <h2>
                  La ingeniería empieza
                  <br />
                  con una buena
                  <br />
                  <em>pregunta.</em>
                </h2>
              )}
              <div>
                {settings.aboutParagraphs.length > 0 ? (
                  settings.aboutParagraphs.map((paragraph, index) => (
                    <p key={paragraph} className={index === 0 ? "lead-copy" : undefined}>
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <>
                    <p className="lead-copy">
                      ¿Qué ocurre dentro de un mineral, un flujo o un conjunto de datos? Mi trabajo
                      empieza por entenderlo.
                    </p>
                    <p>
                      Soy Ingeniero Civil Metalúrgico, titulado con Distinción Máxima y estudiante
                      de Magíster en la Universidad de Concepción. Mi recorrido une investigación en
                      CODELCO, modelamiento CFD y desarrollo de soluciones digitales.
                    </p>
                    <p>
                      Busco aportar en ingeniería de procesos y proyectos, simulación y analítica
                      aplicada a minería. Con rigor experimental, curiosidad y herramientas para
                      convertir evidencia en criterio técnico.
                    </p>
                  </>
                )}
                <Link className="text-link" href="/cv">
                  Conocer mi trayectoria completa <span aria-hidden="true">↗</span>
                </Link>
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

      <ProcessStory />

      <section id="proyectos" className="portfolio-projects">
        <div className="portfolio-container">
          <Reveal>
            <div className="section-topline">
              <div>
                <p className="eyebrow">03 / Trabajo seleccionado</p>
                <h2>
                  De la pregunta
                  <br />
                  <em>al proyecto.</em>
                </h2>
              </div>
              <Link className="text-link" href="/proyectos">
                Ver todos los proyectos ↗
              </Link>
            </div>
          </Reveal>
          <div className="selected-projects">
            {projects
              .filter((p) => p.featured)
              .map((project, i) => (
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
                        {i === 0
                          ? "MINERAL × SOLUCIÓN"
                          : i === 1
                            ? "GEOMETRÍA × FLUJO"
                            : "DATOS × HERRAMIENTAS"}
                      </span>
                    </div>
                    <div className="project-details">
                      <p className="eyebrow">
                        {project.category} / {project.year}
                      </p>
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
          <p className="technical-note">
            Las ilustraciones son conceptuales. Los alcances y cifras corresponden al CV; no
            representan resultados confidenciales ni simulaciones en ejecución.
          </p>
        </div>
      </section>

      <section id="trayectoria" className="portfolio-career">
        <div className="portfolio-container career-grid">
          <div className="career-intro">
            <p className="eyebrow">04 / Trayectoria</p>
            <h2>
              Aprender.
              <br />
              Modelar.
              <br />
              <em>Aportar.</em>
            </h2>
            <p>Industria, investigación y tecnología: un recorrido que sigue construyéndose.</p>
            <Link className="text-link" href="/cv">
              CV completo ↗
            </Link>
          </div>
          <div>
            {experience.map((item) => (
              <Reveal key={item.id}>
                <article className="career-entry">
                  <p className="eyebrow">{item.period}</p>
                  <h3>{item.role}</h3>
                  <p className="career-company">{item.company}</p>
                  <p>{item.highlights[0]}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="laboratorio" className="portfolio-lab">
        <div className="portfolio-container">
          <Reveal>
            <div className="section-topline">
              <div>
                <p className="eyebrow">05 / Ingeniería que puedes explorar</p>
                <h2>
                  Laboratorio digital<span className="copper-dot">.</span>
                </h2>
              </div>
              <p className="lab-intro">
                Una forma de compartir conocimiento: modelos didácticos interactivos para explorar
                fundamentos metalúrgicos.
              </p>
            </div>
          </Reveal>
          <div className="lab-links">
            {[
              {
                n: "01",
                title: "Cinética de flotación",
                detail: "Tiempo, velocidad y recuperación",
                href: "flotacion",
                formula: "R(t)",
              },
              {
                n: "02",
                title: "Balance de masa",
                detail: "Conservación en dos productos",
                href: "balance",
                formula: "F = C + T",
              },
              {
                n: "03",
                title: "Diagrama Eh-pH del cobre",
                detail: "Explora regiones de estabilidad",
                href: "pourbaix",
                formula: "Eh / pH",
              },
            ].map((tool) => (
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
          <p className="technical-note">
            Modelos simplificados para exploración y aprendizaje; requieren validación específica
            antes de cualquier uso operacional.
          </p>
        </div>
      </section>

      <section id="contacto" className="portfolio-contact">
        <div className="portfolio-container contact-grid">
          <div>
            <p className="eyebrow">06 / Lo que viene</p>
            <h2>
              ¿Un desafío
              <br />
              para abordar
              <br />
              <em>juntos?</em>
            </h2>
            <p>
              Abierto a oportunidades en procesos, proyectos, CFD y analítica aplicada. Disponible
              para movilidad nacional, terreno y colaboración interdisciplinaria.
            </p>
            <a className="contact-email" href={`mailto:${settings.email}`}>
              {settings.email} <span aria-hidden="true">↗</span>
            </a>
            <div className="contact-links">
              <Link href="/cv">Ver CV</Link>
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
            <h3>Hablemos de la oportunidad</h3>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
