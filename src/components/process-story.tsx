"use client";

import { useEffect, useRef, useState } from "react";

const spanishChapters = [
  {
    id: "procesos",
    label: "Procesos",
    title: "Primero, entender la física.",
    text: "Mojabilidad, infiltración y capilaridad. En CODELCO estudié cómo interactúan minerales oxidados y soluciones de aglomeración, conectando caracterización y experimentación.",
    tools: "Hidrometalurgia · FRX / DRX / BET · HSC Chemistry",
    metric: "08",
    unit: "simulaciones CFD 2D · OpenFOAM",
    caption: "Del mineral al fenómeno",
    symbol: "Cu",
    detail: "MINERAL / SOLUCIÓN",
  },
  {
    id: "simulacion",
    label: "Simulación",
    title: "Después, poner a prueba el modelo.",
    text: "En el proyecto FONDECYT comparé geometrías de minihidrociclones con ANSYS Fluent. Mallado, condiciones de borde y convergencia para estudiar flujos y separación con trazabilidad.",
    tools: "ANSYS Fluent · OpenFOAM · Análisis paramétrico",
    metric: "12",
    unit: "simulaciones CFD · ANSYS Fluent",
    caption: "De la geometría al flujo",
    symbol: "∇",
    detail: "GEOMETRÍA / FLUJO",
  },
  {
    id: "datos",
    label: "Datos e IA",
    title: "Convertir resultados en evidencia.",
    text: "Python, R, SQL y visualización para ordenar datos, comparar escenarios y documentar decisiones. Complemento este trabajo con desarrollo de software, servidores MCP y fundamentos de IA y calidad de datos.",
    tools: "Python / pandas · SQL · Power BI · TypeScript / MCP",
    metric: "178",
    unit: "horas · Certificado de Datos de Google",
    caption: "Del dato al criterio",
    symbol: "ƒ",
    detail: "DATOS / DECISIONES",
  },
  {
    id: "aprendizaje",
    label: "Evolución",
    title: "Seguir ampliando la mirada.",
    text: "METSIM forma parte de mi formación en simulación de procesos. Quiero profundizar en balances y modelamiento de circuitos; aprender JKSimMet es mi próximo objetivo en conminución y clasificación.",
    tools: "METSIM: formación básica · JKSimMet: próximo aprendizaje",
    metric: "→",
    unit: "aprendizaje continuo en ingeniería",
    caption: "Del aprendizaje a nuevas preguntas",
    symbol: "∞",
    detail: "METSIM / PRÓXIMO: JKSIMMET",
  },
];

const englishChapters = [
  {
    id: "procesos",
    label: "Processes",
    title: "First, understand the physics.",
    text: "Wetting, infiltration and capillarity. At CODELCO I studied how oxidized minerals interact with agglomeration solutions, connecting characterization and experimental research.",
    tools: "Hydrometallurgy · XRF / XRD / BET · HSC Chemistry",
    metric: "08",
    unit: "2D CFD simulations · OpenFOAM",
    caption: "From mineral to mechanism",
    symbol: "Cu",
    detail: "MINERAL / SOLUTION",
  },
  {
    id: "simulacion",
    label: "Simulation",
    title: "Then, put the model to the test.",
    text: "In the FONDECYT project I compared minihydrocyclone geometries with ANSYS Fluent. Meshing, boundary conditions and convergence tracking supported traceable studies of flow and separation.",
    tools: "ANSYS Fluent · OpenFOAM · Parametric analysis",
    metric: "12",
    unit: "CFD simulations · ANSYS Fluent",
    caption: "From geometry to flow",
    symbol: "∇",
    detail: "GEOMETRY / FLOW",
  },
  {
    id: "datos",
    label: "Data & AI",
    title: "Turn results into evidence.",
    text: "Python, R, SQL and visualization to organize data, compare scenarios and document decisions. Complemented by software development, MCP servers and foundational knowledge of AI and data quality.",
    tools: "Python / pandas · SQL · Power BI · TypeScript / MCP",
    metric: "178",
    unit: "hours · Google Data Analytics Certificate",
    caption: "From data to insight",
    symbol: "ƒ",
    detail: "DATA / DECISIONS",
  },
  {
    id: "aprendizaje",
    label: "Learning",
    title: "Keep expanding the perspective.",
    text: "My process simulation training includes an introductory METSIM course. I want to deepen my understanding of balances and circuit modelling; learning JKSimMet is my next objective in comminution and classification.",
    tools: "METSIM: introductory training · JKSimMet: learning goal",
    metric: "→",
    unit: "continuous learning in engineering",
    caption: "From learning to new questions",
    symbol: "∞",
    detail: "METSIM / NEXT: JKSIMMET",
  },
];

export function ProcessStory({ english = false }: { english?: boolean }) {
  const chapters = english ? englishChapters : spanishChapters;
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const elements = ref.current?.querySelectorAll<HTMLElement>("[data-chapter]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting)
            setActive(Number((entry.target as HTMLElement).dataset.chapter));
        }
      },
      { rootMargin: "-30% 0px -40% 0px", threshold: 0 },
    );
    elements?.forEach((element) => {
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  const chapter = chapters[active];

  return (
    <section
      id="especialidades"
      className="process-story"
      ref={ref}
      aria-label={
        english
          ? "My approach: processes, simulation and data"
          : "Mi enfoque: procesos, simulación y datos"
      }
    >
      <div className="portfolio-container story-grid">
        <div className="story-sticky">
          <p className="eyebrow">
            {english ? "02 / A connected perspective" : "02 / Una mirada conectada"}
          </p>
          <h2>
            {english ? "One process." : "Un proceso."}
            <br />
            <em>{english ? "Many perspectives." : "Muchas perspectivas."}</em>
          </h2>
          <div className="story-instrument" data-active={active} aria-hidden="true">
            <div className="instrument-header">
              <span>{english ? "PEGM / CONCEPTUAL STUDY" : "PEGM / ESTUDIO CONCEPTUAL"}</span>
              <span>0{active + 1} — 04</span>
            </div>
            <div className="instrument-drawing">
              <svg viewBox="0 0 400 280" fill="none">
                <title>Ilustración conceptual de flujo</title>
                <defs>
                  <linearGradient id="flow-color">
                    <stop stopColor="#e8a168" />
                    <stop offset="1" stopColor="#83b8bd" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <path
                    key={i}
                    className="flow-line"
                    d={`M 0 ${52 + i * 28} C 100 ${20 + i * 22}, 110 ${260 - i * 30}, 205 140 S 290 ${20 + i * 34}, 400 ${45 + i * 28}`}
                    stroke="url(#flow-color)"
                    strokeWidth="1.2"
                  />
                ))}
                <circle cx="200" cy="140" r="85" stroke="currentColor" strokeDasharray="2 7" />
                <circle cx="200" cy="140" r="60" stroke="currentColor" />
                <path d="M200 32V60M200 220V248M92 140H120M280 140H308" stroke="currentColor" />
              </svg>
              <span className="instrument-symbol" key={chapter.symbol}>
                {chapter.symbol}
              </span>
            </div>
            <div className="instrument-reading">
              <strong>{chapter.metric}</strong>
              <span>{chapter.unit}</span>
            </div>
            <div className="instrument-footer">
              <span>{chapter.detail}</span>
              <span>↗</span>
            </div>
          </div>
          <nav
            className="chapter-nav"
            aria-label={english ? "Approach chapters" : "Etapas del enfoque"}
          >
            {chapters.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={i === active ? "step" : undefined}
              >
                <span>0{i + 1}</span>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="story-chapters">
          {chapters.map((item, i) => (
            <article
              id={item.id}
              data-chapter={i}
              key={item.id}
              className={`story-chapter ${active === i ? "chapter-active" : ""}`}
            >
              <span className="chapter-number">
                0{i + 1} / {item.label}
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <p className="chapter-tools">{item.tools}</p>
              <span className="chapter-caption">
                {item.caption} <span aria-hidden="true">↗</span>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
