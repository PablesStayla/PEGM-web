/** Fuente editorial: CV maestro de Pablo Garrido. Sin métricas inventadas. */
export const site = {
  name: "Pablo Garrido",
  title: "Ingeniero Civil Metalúrgico",
  tagline:
    "Procesos, simulación CFD y analítica de datos aplicada a minería y metalurgia. Transformo evidencia experimental y modelos numéricos en decisiones técnicas trazables.",
  location: "Concepción, Chile",
  email: "contacto@pablogarrido.cl",
  linkedin: "",
  github: "https://github.com/PablesStayla",
  availability: "Abierto a oportunidades · Movilidad nacional",
};
export const stats = [
  { value: "20", label: "Simulaciones CFD documentadas" },
  { value: "46", label: "Estudiantes en software de ingeniería" },
  { value: "220+", label: "Horas de formación certificada" },
];
export const about = {
  label: "Quién soy",
  heading: "Entre el experimento, el modelo y la decisión",
  paragraphs: [
    "Soy Ingeniero Civil Metalúrgico de la Universidad de Concepción, titulado con Distinción Máxima y estudiante de Magíster en Ingeniería Metalúrgica, con foco en procesamiento de minerales.",
    "Mi experiencia conecta la investigación experimental en CODELCO Chuquicamata con la simulación CFD en OpenFOAM y ANSYS Fluent. Me interesa comprender los fenómenos físicos para aportar a procesos y proyectos metalúrgicos.",
    "Integro Python, SQL, visualización y desarrollo de software para organizar evidencia, automatizar análisis y comunicar resultados reproducibles. Busco oportunidades en procesos, proyectos, modelamiento e innovación.",
  ],
};
export const specialities = [
  {
    title: "Procesos e hidrometalurgia",
    description:
      "Lixiviación, aglomeración, humectación y caracterización experimental de minerales oxidados de cobre.",
  },
  {
    title: "Simulación CFD",
    description:
      "OpenFOAM y ANSYS Fluent: geometría, mallado, condiciones de borde, convergencia y análisis paramétrico.",
  },
  {
    title: "Datos y automatización",
    description:
      "Python/pandas, R, SQL, Excel/VBA, Power BI y Tableau para reportabilidad reproducible.",
  },
  {
    title: "Simulación de procesos",
    description:
      "Formación básica en METSIM y herramientas HSC Chemistry. JKSimMet como próximo objetivo de aprendizaje.",
  },
  {
    title: "Proyectos e investigación",
    description:
      "Planificación experimental, documentación técnica y comunicación con equipos industriales y académicos.",
  },
  {
    title: "Software e IA aplicada",
    description:
      "Desarrollo con TypeScript y Python, integración de servicios y servidores MCP. Fundamentos de evaluación de modelos.",
  },
];
export type Experience = { period: string; role: string; company: string; highlights: string[] };
export const experience: Experience[] = [
  {
    period: "Enero 2026 — Actualidad",
    role: "Desarrollador Full Stack independiente",
    company: "Servicios profesionales · Remoto",
    highlights: [
      "Aplicaciones web con TypeScript y Python e integración con servicios externos.",
      "Servidores MCP para conectar herramientas, datos y asistentes de IA.",
      "Prototipado, componentes reutilizables y documentación técnica.",
    ],
  },
  {
    period: "Octubre 2024 — Febrero 2025",
    role: "Investigador colaborador y analista de modelamiento CFD",
    company: "Universidad de Concepción · FONDECYT N.º 11220582 · Colaboración SMI–ICE–Chile",
    highlights: [
      "12 simulaciones CFD en ANSYS Fluent de minihidrociclones conectados en serie.",
      "Evaluación de vortex finder y apex, mallado, condiciones de borde y convergencia.",
      "Organización de parámetros y resultados para comparación y discusión técnica.",
    ],
  },
  {
    period: "Mayo 2022 — Enero 2023",
    role: "Memorista · Hidrometalurgia, lixiviación y CFD",
    company: "CODELCO · División Chuquicamata · Dirección de Procesos Metalúrgicos",
    highlights: [
      "Estudio experimental de mojabilidad e infiltración en minerales oxidados del Distrito Norte.",
      "Caracterización con FRX, DRX, BET, gota sésil, goniometría y procesamiento de imágenes.",
      "8 simulaciones CFD 2D en OpenFOAM 10 sobre capilaridad y aire atrapado en medios porosos.",
    ],
  },
  {
    period: "Septiembre 2020 — Diciembre 2021",
    role: "Ayudante de docencia universitaria",
    company: "Departamento de Ingeniería Metalúrgica · Universidad de Concepción",
    highlights: [
      "Software de ingeniería para 46 estudiantes: MATLAB/Octave, HSC Chemistry y Excel/VBA.",
      "Apoyo académico en cinco asignaturas: software, concentración, cinética, flotación e hidrometalurgia.",
      "Guía de experiencias, evaluación de informes y comunicación de resultados experimentales.",
    ],
  },
];
export const education = [
  {
    period: "En curso",
    degree: "Magíster en Ingeniería Metalúrgica",
    school: "Universidad de Concepción",
    note: "Procesamiento de minerales. Tesis: CFD de dos minihidrociclones con segunda etapa asimétrica para remoción de caolinita ultrafina.",
  },
  {
    period: "Febrero 2024",
    degree: "Ingeniería Civil Metalúrgica",
    school: "Universidad de Concepción",
    note: "Distinción Máxima. Beca de Articulación Pregrado–Postgrado (2023).",
  },
  {
    period: "Agosto 2021",
    degree: "Licenciatura en Ciencias de la Ingeniería",
    school: "Universidad de Concepción",
    note: "",
  },
  {
    period: "Junio 2014",
    degree: "Técnico de Nivel Medio en Mecánica Industrial",
    school: "Liceo Industrial de Concepción",
    note: "Práctica técnica en INDAMA LTDA: mantenimiento, fabricación e interpretación de planos.",
  },
];
export const certifications = [
  "Lean Six Sigma White Belt · CSSC · 2026 (introductorio)",
  "Certificado Profesional en Análisis de Datos · Google/Coursera · 2024 · 178 horas",
  "Hidrógeno Verde: Oportunidades & Aplicaciones · CORFO · 2024 · 30 horas",
  "Básico de Software METSIM · One Brain · 2021 · 16 horas",
  "Project Management Foundations · LinkedIn Learning · 2021",
  "Introducción al Procesado de Minerales de Cobre · Nube Minera · 2021",
  "Crash Course on Python · Google/Coursera · 2021",
  "Power BI Desktop · Udemy · 2021",
  "Excel avanzado y MATLAB · Udemy · 2021",
];
export const skills = {
  software: [
    "ANSYS Fluent",
    "OpenFOAM",
    "METSIM (formación básica)",
    "HSC Chemistry",
    "Python / pandas",
    "SQL",
    "R / RStudio",
    "Power BI",
    "Tableau",
    "MATLAB / Simulink",
    "Excel avanzado / VBA",
    "TypeScript",
    "MS Project",
    "AutoCAD / Inventor",
  ],
  areas: [
    "Hidrometalurgia y lixiviación",
    "Simulación CFD y medios porosos",
    "Procesamiento y separación de minerales",
    "Caracterización FRX / DRX / BET",
    "Balances de masa y análisis paramétrico",
    "Analítica, automatización y reportabilidad",
    "IA/ML: fundamentos y calidad de datos",
    "Próximo aprendizaje: JKSimMet",
  ],
};
export const languages = [
  { name: "Español", level: "Nativo" },
  { name: "Inglés", level: "B2 estimado · lectura técnica alta" },
];
export type Project = {
  title: string;
  category: string;
  year: string;
  summary: string;
  tags: string[];
  featured: boolean;
};
export const projects: Project[] = [
  {
    title: "Mojabilidad e infiltración en minerales oxidados",
    category: "CODELCO · Memoria de título",
    year: "2022–2023",
    summary:
      "Diseño experimental y caracterización de minerales DGM y DRT, integrados con 8 simulaciones CFD 2D para estudiar interacción mineral–solución, capilaridad y aire atrapado.",
    tags: ["OpenFOAM", "Hidrometalurgia", "FRX / DRX / BET"],
    featured: true,
  },
  {
    title: "Minihidrociclones en serie: geometría y separación",
    category: "UdeC · Proyecto FONDECYT",
    year: "2024–2025",
    summary:
      "12 simulaciones en ANSYS Fluent variando vortex finder y apex. Comparación de geometrías, parámetros y convergencia para apoyar el estudio hidráulico y de separación.",
    tags: ["ANSYS Fluent", "CFD", "Análisis paramétrico"],
    featured: true,
  },
  {
    title: "Software e integración de herramientas con IA",
    category: "Desarrollo independiente",
    year: "2026",
    summary:
      "Aplicaciones y prototipos con TypeScript y Python; servidores MCP para conectar servicios y recursos externos con asistentes de IA, con foco en modularidad y documentación.",
    tags: ["TypeScript", "Python", "MCP"],
    featured: true,
  },
  {
    title: "Modelación CFD para remoción de caolinita ultrafina",
    category: "Tesis de magíster · En curso",
    year: "En curso",
    summary:
      "Modelación de un sistema O–F de dos minihidrociclones con segunda etapa asimétrica, como línea de investigación del Magíster en Ingeniería Metalúrgica.",
    tags: ["Modelamiento", "Minihidrociclones", "Investigación"],
    featured: false,
  },
];
export const contact = {
  label: "Contacto",
  heading: "Conversemos de tu próximo proyecto",
  text: "Abierto a oportunidades en procesos, proyectos, simulación y analítica aplicada. Movilidad nacional y disposición a trabajo en terreno.",
  cta: "Escribir un correo",
  secondary: "También en",
};
export const techStack = [
  "OpenFOAM",
  "ANSYS Fluent",
  "METSIM",
  "Python",
  "SQL",
  "Power BI",
  "TypeScript",
];
export const sampleMessages: { name: string; email: string; body: string; read: boolean }[] = [];
