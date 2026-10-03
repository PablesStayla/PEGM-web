/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CONTENIDO DEL SITIO
 *  Este es el único archivo que necesitas editar para actualizar el sitio:
 *  textos, experiencia, educación, proyectos, habilidades y contacto.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const site = {
  name: "Pablo",
  title: "Ingeniero Civil Metalúrgico",
  tagline:
    "Especialista en procesamiento de minerales y optimización de procesos. Transformo datos de planta en decisiones que mejoran la recuperación, los costos y la sostenibilidad de la operación.",
  location: "Concepción, Chile",
  email: "pablo@ejemplo.cl", // ← reemplazar por tu correo real
  linkedin: "https://www.linkedin.com/in/pablo-ejemplo", // ← reemplazar por tu perfil real
  github: "https://github.com/PablesStayla",
  availability: "Disponible para consultoría y proyectos",
};

export const stats = [
  { value: "8+", label: "Años de experiencia" },
  { value: "20+", label: "Proyectos y estudios" },
  { value: "5", label: "Plantas y operaciones" },
];

export const about = {
  label: "Quién soy",
  heading: "Ingeniería metalúrgica con mirada práctica",
  paragraphs: [
    "Soy ingeniero civil metalúrgico con experiencia en operaciones y proyectos de la gran y mediana minería chilena. He trabajado en plantas concentradoras, hidrometalúrgicas y de fundición, siempre con el mismo objetivo: que el proceso entregue su máximo valor.",
    "Mi trabajo combina la rigor técnico del laboratorio con la lectura del día a día de la planta: caracterización mineralógica, balances de masa, pruebas en planta y análisis de datos para tomar decisiones que se sostienen en el tiempo.",
    "Vivo en Concepción, Chile. Además de la ingeniería, me interesa la programación aplicada al análisis de datos operacionales y la automatización de reportabilidad metalúrgica.",
  ],
};

export const specialities = [
  {
    title: "Procesamiento de minerales",
    description:
      "Conminución, clasificación y flotación: auditoría, diseño y optimización de circuitos para maximizar recuperación y ley de concentrado.",
  },
  {
    title: "Hidrometalurgia",
    description:
      "Lixiviación en pilas, extracción por solventes (SX) y electroobtención (EW): control de impurezas y eficiencia del circuito.",
  },
  {
    title: "Pirometalurgia",
    description:
      "Fundición y refinación de concentrados: balance de energía, control de impurezas y calidad de producto.",
  },
  {
    title: "Modelación y simulación",
    description:
      "Balances de masa y energía, simulación de procesos en HSC y Aspen, y modelos predictivos con Python.",
  },
  {
    title: "Optimización y control",
    description:
      "Análisis de variabilidad operacional, control avanzado de procesos y mejora continua (Six Sigma).",
  },
  {
    title: "Gestión de proyectos",
    description:
      "Estudios de prefactibilidad, ingeniería de concepto, QA/QC y coordinación de equipos multidisciplinarios.",
  },
];

export type Experience = {
  period: string;
  role: string;
  company: string;
  highlights: string[];
};

export const experience: Experience[] = [
  {
    period: "2022 — Actualidad",
    role: "Ingeniero Senior de Procesos",
    company: "Gran minería del cobre · Chile",
    highlights: [
      "Lideré la optimización del circuito de flotación colectiva, logrando un aumento sostenido de 2,1 puntos porcentuales en la recuperación de cobre.",
      "Implementé un modelo predictivo de ley de cabeza en Python, reduciendo la variabilidad operacional del circuito de molienda.",
      "Coordiné campañas de pruebas metalúrgicas en planta y laboratorio, desde el diseño experimental hasta la puesta en marcha.",
    ],
  },
  {
    period: "2019 — 2022",
    role: "Ingeniero Metalúrgico de Planta",
    company: "Fundición y refinería · Chile",
    highlights: [
      "Responsable del balance metalúrgico diario y de la reportabilidad de producción hacia gerencia y casa matriz.",
      "Reduje en 4% el consumo específico de energía del horno mediante ajustes de operación y control de carga.",
      "Participé en el proyecto de control de impurezas (As, Sb, Bi) en línea de producción de ánodos.",
    ],
  },
  {
    period: "2017 — 2019",
    role: "Ingeniero de Proyectos",
    company: "Consultoría minera · Santiago, Chile",
    highlights: [
      "Desarrollé estudios de prefactibilidad para plantas modulares de procesamiento de minerales, incluyendo Capex/Opex y bases de diseño.",
      "Elaboré especificaciones técnicas y apoyé la evaluación técnica de propuestas de proveedores.",
    ],
  },
  {
    period: "2016",
    role: "Práctica profesional",
    company: "Planta concentradora · Chile",
    highlights: [
      "Seguimiento operacional de molienda y flotación, y apoyo en el control de calidad de concentrados.",
    ],
  },
];

export const education = [
  {
    period: "2012 — 2017",
    degree: "Ingeniería Civil Metalúrgica",
    school: "Universidad de Concepción",
    note: "Título de Ingeniero Civil Metalúrgico",
  },
  {
    period: "2020",
    degree: "Diplomado en Gestión de Operaciones Mineras",
    school: "Institución de educación continua",
    note: "",
  },
];

export const certifications = [
  "Six Sigma Green Belt",
  "Simulación de procesos con HSC Chemistry",
  "Analítica de datos operacionales con Power BI",
];

export const skills = {
  software: [
    "Python (pandas, scikit-learn)",
    "HSC Chemistry",
    "Aspen Plus",
    "JKSimMet",
    "MATLAB",
    "Excel avanzado / VBA",
    "Power BI",
    "SQL",
  ],
  areas: [
    "Flotación de sulfuros",
    "Lixiviación SX-EW",
    "Balance de masa y energía",
    "Control de impurezas",
    "Caracterización mineralógica",
    "Análisis de datos de planta",
  ],
};

export const languages = [
  { name: "Español", level: "Nativo" },
  { name: "Inglés", level: "Avanzado (C1)" },
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
    title: "Optimización del circuito de flotación colectiva",
    category: "Procesamiento de minerales",
    year: "2024",
    summary:
      "Aumento sostenido de 2,1 pp en recuperación de cobre a partir de caracterización mineralógica, ajuste de química de flotación y estabilización del circuito rougher.",
    tags: ["Flotación", "Recuperación Cu", "Pruebas en planta"],
    featured: true,
  },
  {
    title: "Modelo predictivo de ley de cabeza",
    category: "Analítica de datos",
    year: "2023",
    summary:
      "Modelo de machine learning en Python que anticipa la ley de cabeza con seis horas de anticipación, integrado al reporte de turno del operador.",
    tags: ["Python", "scikit-learn", "Control de procesos"],
    featured: true,
  },
  {
    title: "Simulación y balance de masa de planta SX-EW",
    category: "Hidrometalurgia",
    year: "2023",
    summary:
      "Modelo del circuito completo en HSC Chemistry para cuantificar pérdidas de cobre y evaluar escenarios de aumento de producción.",
    tags: ["HSC Chemistry", "SX-EW", "Balance de masa"],
    featured: false,
  },
  {
    title: "Estudio de prefactibilidad de planta modular",
    category: "Gestión de proyectos",
    year: "2022",
    summary:
      "Evaluación técnico-económica de una planta modular de procesamiento para yacimiento mediano: bases de diseño, Capex/Opex y análisis de sensibilidad.",
    tags: ["Prefactibilidad", "Capex/Opex", "Ingeniería de concepto"],
    featured: false,
  },
  {
    title: "Reducción de energía específica en molienda SAG",
    category: "Procesamiento de minerales",
    year: "2021",
    summary:
      "Disminución del consumo energético por tonelada tratada mediante control de granulometría de alimentación y estrategia de carga de bolas.",
    tags: ["Molienda SAG", "Eficiencia energética"],
    featured: false,
  },
  {
    title: "Tablero de reporte metalúrgico diario",
    category: "Analítica de datos",
    year: "2020",
    summary:
      "Automatización del reporte diario de metales y agua: de planillas manuales a un tablero Power BI con datos actualizados cada turno.",
    tags: ["Power BI", "Automatización", "Reportabilidad"],
    featured: false,
  },
];

export const contact = {
  label: "Contacto",
  heading: "Trabajemos juntos",
  text: "Si tienes un desafío metalúrgico, un proyecto que evaluar o un proceso que optimizar, escríbeme. Respondí normalmente en menos de 24 horas.",
  cta: "Escribir un correo",
  secondary: "O encuéntrame en",
};

/**
 * Stack técnico que se muestra en el sitio (sección "Ingeniería + código").
 */
export const techStack = [
  "TypeScript",
  "React",
  "Next.js",
  "Tailwind CSS",
  "Python",
  "SQL",
  "Drizzle ORM",
  "SVG",
];

/**
 * Mensajes de ejemplo para la bandeja de entrada del panel (solo semilla).
 */
export const sampleMessages = [
  {
    name: "María González",
    email: "maria@minera-ejemplo.cl",
    body: "Hola Pablo, vi tu perfil y nos interesa conversar sobre una consultoría de optimización de flotación para nuestra planta. ¿Tienes disponibilidad la próxima semana?",
    read: false,
  },
  {
    name: "Diego Rojas",
    email: "diego.rojas@ejemplo.com",
    body: "Excelente tu simulador de cinética de flotación. ¿Podrías compartir el enfoque que usaste para el ajuste de parámetros? Saludos.",
    read: true,
  },
];
