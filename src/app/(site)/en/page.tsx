import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProcessStory } from "@/components/process-story";
import { Reveal } from "@/components/reveal";
import { getSettings } from "@/lib/data";

export const revalidate = 120;
export const metadata: Metadata = {
  title: { absolute: "Pablo Garrido — Metallurgical Engineer | CFD & Data Analytics" },
  description:
    "Metallurgical Engineer from Universidad de Concepción. Experimental research at CODELCO, CFD in OpenFOAM and ANSYS Fluent, process simulation and data analytics.",
  alternates: { canonical: "/en", languages: { "es-CL": "/", en: "/en" } },
  openGraph: {
    locale: "en_US",
    url: "/en",
    title: "Pablo Garrido — Metallurgical Engineer",
    description: "Processes, CFD simulation and data analytics for mining and metallurgy.",
  },
};

export default async function EnglishPortfolio() {
  const settings = await getSettings();
  return (
    <div className="portfolio" lang="en">
      <section className="portfolio-hero">
        <div className="portfolio-container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" /> Open to opportunities
            </p>
            <p className="hero-role">Metallurgical Engineer · Universidad de Concepción</p>
            <h1>
              Pablo
              <br />
              Garrido<span className="copper-dot">.</span>
            </h1>
            <p className="hero-manifesto">
              Understand the process.
              <br />
              <em>Inform the decision.</em>
            </p>
            <p className="hero-description">
              I connect metallurgy, simulation and data to tackle engineering challenges. From
              experimental evidence to numerical models, and from models to traceable technical
              decisions.
            </p>
            <div className="hero-actions">
              <a className="portfolio-button primary" href="#projects">
                Explore my work ↘
              </a>
              <a className="portfolio-button" href="/cv-pablo-garrido.pdf" download>
                Download CV (Spanish) ↓
              </a>
            </div>
            <p className="hero-location">
              Concepción, Chile — Available for relocation within Chile
            </p>
          </div>
          <div className="portrait-composition">
            <div className="portrait-frame">
              <Image
                src="/pablo-garrido-sin-reflejo.png"
                width={1254}
                height={1254}
                sizes="(max-width: 760px) 90vw, 42vw"
                preload
                alt="Pablo Garrido, Metallurgical Engineer"
                className="hero-portrait"
              />
            </div>
            <div className="portrait-caption">
              <span>ENGINEERING WITH EVIDENCE</span>
              <span>36°49′ S · 73°03′ W</span>
            </div>
            <div className="portrait-note">
              <span className="eyebrow">Professional focus</span>
              <p>
                Processes.
                <br />
                Simulation.
                <br />
                <em>Data.</em>
              </p>
            </div>
          </div>
        </div>
        <div className="portfolio-container hero-bottom">
          <a href="#about">Scroll to discover my approach ↓</a>
          <span>PORTFOLIO / 2026</span>
        </div>
      </section>
      <section id="about" className="portfolio-about">
        <div className="portfolio-container">
          <Reveal>
            <p className="eyebrow">01 / The approach</p>
            <div className="about-grid">
              <h2>
                Engineering starts
                <br />
                with a good
                <br />
                <em>question.</em>
              </h2>
              <div>
                <p className="lead-copy">
                  What happens inside a mineral, a flow or a dataset? Understanding comes first.
                </p>
                <p>
                  I graduated in Metallurgical Engineering with highest distinction from Universidad
                  de Concepción, where I am currently pursuing a master’s degree in mineral
                  processing.
                </p>
                <p>
                  My experience spans experimental hydrometallurgical research at CODELCO, CFD
                  studies of porous media and minihydrocyclones, and independent software
                  development. I am interested in process engineering, engineering projects,
                  simulation and applied analytics.
                </p>
                <p>Spanish native; estimated B2 English, with strong technical reading skills.</p>
              </div>
            </div>
          </Reveal>
          <dl className="portfolio-stats">
            {[
              { value: "20", label: "Documented CFD simulations" },
              { value: "46", label: "Students taught engineering software" },
              { value: "220+", label: "Certified training hours" },
            ].map((item) => (
              <div key={item.label}>
                <dt>
                  {item.value}
                  <span>/</span>
                </dt>
                <dd>{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <ProcessStory english />
      <section id="projects" className="portfolio-projects">
        <div className="portfolio-container">
          <p className="eyebrow">03 / Selected work</p>
          <h2>
            From questions
            <br />
            <em>to projects.</em>
          </h2>
          <div className="selected-projects">
            {[
              {
                title: "Wetting and infiltration in oxidized copper minerals",
                context: "CODELCO · Undergraduate thesis · 2022–2023",
                text: "Experimental characterization of DGM and DRT minerals using XRF, XRD, BET, sessile drops and image processing. Eight 2D CFD simulations in OpenFOAM 10 explored capillarity and trapped air in porous media.",
                tags: ["Hydrometallurgy", "OpenFOAM", "Experimental research"],
              },
              {
                title: "Minihydrocyclones in series: geometry and separation",
                context: "Universidad de Concepción · FONDECYT · 2024–2025",
                text: "Twelve ANSYS Fluent simulations varying vortex finder and apex dimensions. Geometry preparation, meshing, boundary conditions and convergence tracking supported parametric comparison and technical reporting.",
                tags: ["ANSYS Fluent", "CFD", "Parametric analysis"],
              },
              {
                title: "Software and AI tool integration",
                context: "Independent development · 2026–present",
                text: "Web applications and prototypes in TypeScript and Python. MCP servers connect external resources and services with AI assistants, with an emphasis on modularity, documentation and maintainability.",
                tags: ["Python", "TypeScript", "MCP"],
              },
            ].map((project, i) => (
              <Reveal key={project.title}>
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
                    <span className="art-footnote">CONCEPTUAL ILLUSTRATION</span>
                  </div>
                  <div className="project-details">
                    <p className="eyebrow">{project.context}</p>
                    <h3>{project.title}</h3>
                    <p>{project.text}</p>
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
            Illustrations are conceptual. Project scopes and figures are sourced from my CV, not
            confidential results or live simulations.
          </p>
        </div>
      </section>
      <section className="portfolio-lab">
        <div className="portfolio-container">
          <p className="eyebrow">04 / Explore the fundamentals</p>
          <div className="section-topline">
            <h2>
              Digital laboratory<span className="copper-dot">.</span>
            </h2>
            <p className="lab-intro">
              Interactive educational models for flotation kinetics, two-product mass balances and
              the copper Eh-pH diagram.
            </p>
          </div>
          <Link className="portfolio-button primary" href="/laboratorio">
            Explore the laboratory (Spanish) ↗
          </Link>
          <p className="technical-note">
            Simplified educational models; application to operations requires specific validation.
          </p>
        </div>
      </section>
      <section id="contacto" className="portfolio-contact">
        <div className="portfolio-container contact-grid">
          <div>
            <p className="eyebrow">05 / What comes next</p>
            <h2>
              A challenge
              <br />
              we can tackle
              <br />
              <em>together?</em>
            </h2>
            <p>
              Open to roles in process engineering, projects, CFD and applied data analytics.
              Available for fieldwork and relocation within Chile.
            </p>
            <a className="contact-email" href={`mailto:${settings.email}`}>
              {settings.email} ↗
            </a>
            <div className="contact-links">
              <a href={settings.github} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
              <Link href="/cv">Full CV (Spanish)</Link>
            </div>
          </div>
          <div className="contact-form-panel">
            <h3>Let’s start a conversation.</h3>
            <p>Send me an email with the role, project or technical challenge you have in mind.</p>
            <a
              className="portfolio-button primary mt-6"
              href={`mailto:${settings.email}?subject=Professional%20opportunity`}
            >
              Get in touch ↗
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
