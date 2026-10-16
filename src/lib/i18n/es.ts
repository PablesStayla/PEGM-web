/** Titular editorial: líneas con salto duro + línea final en cursiva (clase `em`). */
export type Headline = {
  lines: string[];
  accent: string;
};

export type StoryChapter = {
  id: string;
  label: string;
  title: string;
  text: string;
  tools: string;
  metric: string;
  unit: string;
  caption: string;
  symbol: string;
  detail: string;
};

export type StoryDict = {
  eyebrow: string;
  heading: Headline;
  instrumentLabel: string;
  svgTitle: string;
  ariaSection: string;
  ariaNav: string;
  chapters: StoryChapter[];
};

export type FeaturedProject = {
  id: string;
  meta: string;
  title: string;
  summary: string;
  tags: string[];
};

export type AboutSection = {
  eyebrow: string;
  /** Ancla de la sección (`#sobre-mi` en ES, `#about` en EN). */
  anchor: string;
  /** Si está definido, se pinta el enlace de cierre de la sección. */
  cta?: string;
  /** Texto plano (ajustes de la BD) o titular artístico. */
  heading: string | Headline;
  /** Párrafos; el primero se muestra como lead. */
  paragraphs: string[];
};

export type Dictionary = {
  nav: {
    home: string;
    projects: string;
    laboratory: string;
    cv: string;
    contact: string;
    search: string;
  };
  hero: {
    availability: string;
    role: string;
    manifesto: Headline;
    description: string;
    primaryCta: string;
    downloadCta: string;
    location: string;
    scrollHint: string;
    tag: string;
    portraitAlt: string;
    portraitCaption: [string, string];
    portraitNoteEyebrow: string;
    portraitNote: Headline;
  };
  about: AboutSection;
  stats: { value: string; label: string }[];
  story: StoryDict;
  projects: {
    eyebrow: string;
    /** Ancla de la sección (`#proyectos` en ES, `#projects` en EN). */
    anchor: string;
    heading: Headline;
    ctaAll: string;
    footnote: string;
    /** Pie de la ilustración por índice (si falta, se repite el primero). */
    artFootnotes: string[];
    /** Solo EN: destacados estáticos (en ES vienen de la BD). */
    items?: FeaturedProject[];
  };
  career: {
    /** EN no muestra la sección de trayectoria. */
    show: boolean;
    eyebrow: string;
    heading: Headline;
    intro: string;
    cta: string;
  };
  lab: {
    eyebrow: string;
    /** Lleva el punto cobre final (`<span className="copper-dot">.`). */
    heading: string;
    intro: string;
    mode: "links" | "cta";
    links?: { n: string; title: string; detail: string; href: string; formula: string }[];
    ctaLabel?: string;
    ctaHref?: string;
    footnote: string;
  };
  contact: {
    eyebrow: string;
    /** Ancla de la sección (`#contacto` en ambos idiomas). */
    id: string;
    heading: Headline;
    intro: string;
    cvLabel: string;
    panelHeading: string;
    /** Solo EN (panel con mailto en lugar de formulario). */
    panelIntro?: string;
    useForm: boolean;
    ctaLabel?: string;
    ctaSubject?: string;
  };
};

/**
 * Diccionario español — fuente de verdad del tipo. Literales trasladados
 * tal cual desde los componentes; las etiquetas de `stats` siguen a
 * `src/lib/content.ts` (fuente del seed).
 */
export const es: Dictionary = {
  nav: {
    home: "Inicio",
    projects: "Proyectos",
    laboratory: "Laboratorio",
    cv: "CV",
    contact: "Contacto",
    search: "Buscar en el sitio (Ctrl+K)",
  },
  hero: {
    availability: "Abierto a oportunidades",
    role: "Ingeniero Civil Metalúrgico · Universidad de Concepción",
    manifesto: { lines: ["Comprender el proceso."], accent: "Transformar la decisión." },
    description:
      "Conecto metalurgia, simulación y datos para abordar desafíos de ingeniería. De la evidencia experimental al modelo; del modelo a una decisión trazable.",
    primaryCta: "Explorar mi trabajo",
    downloadCta: "Descargar CV",
    location: "Concepción, Chile — Movilidad nacional",
    scrollHint: "Baja para conocer mi enfoque",
    tag: "PORTAFOLIO / 2026",
    portraitAlt: "Pablo Garrido, Ingeniero Civil Metalúrgico",
    portraitCaption: ["INGENIERÍA CON FUNDAMENTO", "36°49′ S · 73°03′ O"],
    portraitNoteEyebrow: "Foco profesional",
    portraitNote: { lines: ["Procesos.", "Simulación."], accent: "Datos." },
  },
  about: {
    eyebrow: "01 / El enfoque",
    anchor: "sobre-mi",
    cta: "Conocer mi trayectoria completa",
    heading: { lines: ["La ingeniería empieza", "con una buena"], accent: "pregunta." },
    paragraphs: [
      "¿Qué ocurre dentro de un mineral, un flujo o un conjunto de datos? Mi trabajo empieza por entenderlo.",
      "Soy Ingeniero Civil Metalúrgico, titulado con Distinción Máxima y estudiante de Magíster en la Universidad de Concepción. Mi recorrido une investigación en CODELCO, modelamiento CFD y desarrollo de soluciones digitales.",
      "Busco aportar en ingeniería de procesos y proyectos, simulación y analítica aplicada a minería. Con rigor experimental, curiosidad y herramientas para convertir evidencia en criterio técnico.",
    ],
  },
  stats: [
    { value: "20", label: "Simulaciones CFD documentadas" },
    { value: "46", label: "Estudiantes en software de ingeniería" },
    { value: "220+", label: "Horas de formación certificada" },
  ],
  story: {
    eyebrow: "02 / Una mirada conectada",
    heading: { lines: ["Un proceso."], accent: "Muchas perspectivas." },
    instrumentLabel: "PEGM / ESTUDIO CONCEPTUAL",
    svgTitle: "Ilustración conceptual de flujo",
    ariaSection: "Mi enfoque: procesos, simulación y datos",
    ariaNav: "Etapas del enfoque",
    chapters: [
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
    ],
  },
  projects: {
    eyebrow: "03 / Trabajo seleccionado",
    anchor: "proyectos",
    heading: { lines: ["De la pregunta"], accent: "al proyecto." },
    ctaAll: "Ver todos los proyectos",
    footnote:
      "Las ilustraciones son conceptuales. Los alcances y cifras corresponden al CV; no representan resultados confidenciales ni simulaciones en ejecución.",
    artFootnotes: ["MINERAL × SOLUCIÓN", "GEOMETRÍA × FLUJO", "DATOS × HERRAMIENTAS"],
  },
  career: {
    show: true,
    eyebrow: "04 / Trayectoria",
    heading: { lines: ["Aprender.", "Modelar."], accent: "Aportar." },
    intro: "Industria, investigación y tecnología: un recorrido que sigue construyéndose.",
    cta: "CV completo",
  },
  lab: {
    eyebrow: "05 / Ingeniería que puedes explorar",
    heading: "Laboratorio digital",
    intro:
      "Una forma de compartir conocimiento: modelos didácticos interactivos para explorar fundamentos metalúrgicos.",
    mode: "links",
    links: [
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
    ],
    footnote:
      "Modelos simplificados para exploración y aprendizaje; requieren validación específica antes de cualquier uso operacional.",
  },
  contact: {
    eyebrow: "06 / Lo que viene",
    id: "contacto",
    heading: { lines: ["¿Un desafío", "para abordar"], accent: "juntos?" },
    intro:
      "Abierto a oportunidades en procesos, proyectos, CFD y analítica aplicada. Disponible para movilidad nacional, terreno y colaboración interdisciplinaria.",
    cvLabel: "Ver CV",
    panelHeading: "Hablemos de la oportunidad",
    useForm: true,
  },
};
