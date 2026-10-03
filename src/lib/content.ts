/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CONTENIDO DEL SITIO
 *  Este es el único archivo que necesitas editar para actualizar el sitio:
 *  textos, experiencia, educación, proyectos, habilidades y contacto.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const site = {
  name: "Pablo Garrido",
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

export type ProjectMetric = {
  value: string;
  label: string;
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  summary: string;
  tags: string[];
  featured: boolean;
  duration: string;
  context: string;
  challenge: string;
  approach: string[];
  metrics: ProjectMetric[];
  results: string[];
  closing: string;
  caseStudy: boolean;
  visualStyle: string;
};

export const projects: Project[] = [
  {
    slug: "optimizacion-circuito-flotacion-colectiva",
    title: "Optimización del circuito de flotación colectiva",
    category: "Procesamiento de minerales",
    year: "2024",
    summary:
      "Aumento sostenido de 2,1 pp en recuperación de cobre a partir de caracterización mineralógica, ajuste de química de flotación y estabilización del circuito rougher.",
    tags: ["Flotación", "Recuperación Cu", "Pruebas en planta"],
    featured: true,
    duration: "16 semanas",
    context:
      "Una concentradora de cobre procesaba mineral con mayor presencia de especies secundarias y variabilidad creciente en la alimentación. Aunque el tonelaje se mantenía, la recuperación del circuito colectivo había perdido estabilidad y los ajustes de turno no lograban sostener una respuesta consistente.",
    challenge:
      "Separar el efecto de la mineralogía, la química y la operación para recuperar desempeño sin comprometer la ley de concentrado ni reducir el tratamiento. El trabajo debía ejecutarse con la planta en marcha y producir recomendaciones que los equipos de turno pudieran aplicar.",
    approach: [
      "Construí una línea base con seis meses de datos de planta y concilié el balance metalúrgico para identificar pérdidas y variables de mayor influencia.",
      "Diseñé una campaña de muestreo y pruebas cinéticas por banco, complementada con caracterización mineralógica de alimentación, concentrado y relave.",
      "Evalué dosis y puntos de adición de colector y espumante mediante pruebas controladas, y definí ventanas operacionales para aire, nivel y profundidad de espuma.",
      "Acompañé la prueba industrial y convertí los hallazgos en una pauta de control por turno con seguimiento semanal.",
    ],
    metrics: [
      { value: "+2,1 pp", label: "recuperación de cobre" },
      { value: "−18 %", label: "variabilidad de recuperación" },
      { value: "0 t/h", label: "pérdida de tratamiento" },
    ],
    results: [
      "La recuperación aumentó de forma sostenida manteniendo la ley de concentrado dentro de especificación.",
      "La nueva estrategia redujo las correcciones reactivas entre turnos y entregó límites claros para las variables manipulables.",
      "El protocolo de muestreo quedó instalado como herramienta de diagnóstico para futuros cambios mineralógicos.",
    ],
    closing:
      "El principal aprendizaje fue que el reactivo no era una palanca aislada: la mejora apareció al conectar mineralogía, estabilidad del rougher y disciplina de control. Ese enfoque convirtió una prueba puntual en una práctica operacional repetible.",
    caseStudy: true,
    visualStyle: "flotation",
  },
  {
    slug: "modelo-predictivo-ley-cabeza",
    title: "Modelo predictivo de ley de cabeza",
    category: "Analítica de datos",
    year: "2023",
    summary:
      "Modelo de machine learning en Python que anticipa la ley de cabeza con seis horas de anticipación, integrado al reporte de turno del operador.",
    tags: ["Python", "scikit-learn", "Control de procesos"],
    featured: true,
    duration: "10 semanas",
    context:
      "La planta recibía mineral desde varios frentes con tiempos de transporte y mezcla distintos. La ley reportada por laboratorio llegaba cuando parte del material ya había atravesado molienda, por lo que los equipos operaban con una señal atrasada.",
    challenge:
      "Entregar una estimación útil —no solo un buen ajuste estadístico— con seis horas de anticipación, datos industriales incompletos y una interfaz que se incorporara al reporte existente sin sumar carga al operador.",
    approach: [
      "Unifiqué datos de despacho, chancado, stockpile y laboratorio; traté desfases temporales, valores faltantes y cambios de instrumentación.",
      "Construí variables asociadas al origen del mineral, tiempos de residencia y mezclas móviles, evitando cualquier dato que no estuviera disponible al momento de predecir.",
      "Comparé un modelo base, ensambles de árboles y regresión regularizada con validación temporal para prevenir fuga de información.",
      "Implementé la predicción y su intervalo de confianza en el reporte de turno, junto con monitoreo de error y reglas de uso.",
    ],
    metrics: [
      { value: "6 h", label: "de anticipación" },
      { value: "−32 %", label: "error frente al modelo base" },
      { value: "1 reporte", label: "integración sin pantalla adicional" },
    ],
    results: [
      "Los turnos obtuvieron una señal anticipada para preparar los setpoints de molienda y flotación ante cambios de alimentación.",
      "El intervalo de confianza permitió distinguir una predicción accionable de períodos con información insuficiente.",
      "La rutina de reentrenamiento y seguimiento dejó trazabilidad sobre la vigencia del modelo.",
    ],
    closing:
      "El valor no estuvo en elegir el algoritmo más complejo, sino en ordenar los tiempos del proceso y mostrar incertidumbre. La adopción mejoró cuando la predicción llegó al lugar donde ya se tomaban las decisiones.",
    caseStudy: true,
    visualStyle: "prediction",
  },
  {
    slug: "simulacion-balance-masa-planta-sx-ew",
    title: "Simulación y balance de masa de planta SX-EW",
    category: "Hidrometalurgia",
    year: "2023",
    summary:
      "Modelo del circuito completo en HSC Chemistry para cuantificar pérdidas de cobre y evaluar escenarios de aumento de producción.",
    tags: ["HSC Chemistry", "SX-EW", "Balance de masa"],
    featured: false,
    duration: "12 semanas",
    context:
      "Una operación hidrometalúrgica evaluaba aumentar producción, pero sus balances por área utilizaban bases y frecuencias distintas. Las discrepancias entre lixiviación, SX y EW impedían reconocer dónde se perdía cobre y cuánto margen real tenía el circuito.",
    challenge:
      "Construir una única representación reconciliada del proceso, capaz de cerrar agua, soluciones y cobre, y usarla para comparar alternativas sin confundir capacidad nominal con restricciones operacionales.",
    approach: [
      "Definí límites, corrientes y una base temporal común; luego realicé una auditoría de mediciones y criterios de muestreo.",
      "Reconcilié el caso base con balances por especie y solución, documentando supuestos y nivel de confianza de cada dato.",
      "Implementé el flowsheet en HSC Chemistry y lo contrasté con períodos estables de operación.",
      "Simulé escenarios de mayor riego, eficiencia de extracción, inventario orgánico y densidad de corriente para localizar cuellos de botella.",
    ],
    metrics: [
      { value: ">98 %", label: "cierre del balance de cobre" },
      { value: "4", label: "escenarios comparados" },
      { value: "2", label: "restricciones críticas identificadas" },
    ],
    results: [
      "El modelo hizo visibles pérdidas antes absorbidas por diferencias de inventario y criterios de reporte.",
      "La evaluación descartó una expansión que trasladaba la restricción a EW y priorizó mejoras de menor inversión en SX.",
      "La operación recibió un balance trazable que puede actualizarse con datos mensuales.",
    ],
    closing:
      "Antes de simular el futuro fue necesario acordar una sola versión del presente. La reconciliación de datos resultó tan importante como el modelo para sostener la decisión de inversión.",
    caseStudy: true,
    visualStyle: "hydrometallurgy",
  },
  {
    slug: "prefactibilidad-planta-modular",
    title: "Estudio de prefactibilidad de planta modular",
    category: "Gestión de proyectos",
    year: "2022",
    summary:
      "Evaluación técnico-económica de una planta modular de procesamiento para yacimiento mediano: bases de diseño, Capex/Opex y análisis de sensibilidad.",
    tags: ["Prefactibilidad", "Capex/Opex", "Ingeniería de concepto"],
    featured: false,
    duration: "14 semanas",
    context:
      "Un yacimiento de escala media requería comparar una planta modular con el envío de mineral a terceros. La información metalúrgica era temprana y el proyecto necesitaba una base consistente para decidir si avanzar a ingeniería de factibilidad.",
    challenge:
      "Traducir información geológica y pruebas preliminares en una alternativa técnica dimensionada, con rangos de costo y riesgos explícitos, sin presentar como certeza lo que aún correspondía validar.",
    approach: [
      "Definí criterios de diseño, casos de mineral y disponibilidad, y levanté brechas de información con impacto en la decisión.",
      "Desarrollé el diagrama de proceso, balance de masa, listado de equipos principales y estrategia de modularización.",
      "Estimé Capex y Opex con cotizaciones referenciales, factores de instalación y contingencias coherentes con el nivel de estudio.",
      "Construí sensibilidades para ley, recuperación, precio, tonelaje y logística, y facilité una revisión multidisciplinaria de riesgos.",
    ],
    metrics: [
      { value: "±25 %", label: "rango de precisión de costos" },
      { value: "3", label: "alternativas de proceso" },
      { value: "5", label: "variables de sensibilidad" },
    ],
    results: [
      "La comparación técnico-económica entregó un caso recomendado y condiciones claras para que mantuviera valor.",
      "Se identificaron las pruebas metalúrgicas y geotécnicas que debían preceder la siguiente etapa.",
      "La modularización permitió separar inversión inicial y expansión, reduciendo exposición temprana de capital.",
    ],
    closing:
      "Una prefactibilidad útil no elimina incertidumbre: la ordena. Expresar rangos, supuestos y decisiones pendientes permitió avanzar con una hoja de ruta verificable.",
    caseStudy: true,
    visualStyle: "feasibility",
  },
  {
    slug: "reduccion-energia-molienda-sag",
    title: "Reducción de energía específica en molienda SAG",
    category: "Procesamiento de minerales",
    year: "2021",
    summary:
      "Disminución del consumo energético por tonelada tratada mediante control de granulometría de alimentación y estrategia de carga de bolas.",
    tags: ["Molienda SAG", "Eficiencia energética"],
    featured: false,
    duration: "12 semanas",
    context:
      "El molino SAG mantenía el objetivo de tratamiento, pero con alta dispersión de energía específica y episodios de sobrecarga. Los cambios de dureza y granulometría se abordaban con ajustes distintos según el turno.",
    challenge:
      "Reducir consumo sin sacrificar tonelaje ni transferir el problema a molienda secundaria, distinguiendo las pérdidas asociadas al mineral de aquellas controlables mediante carga y operación.",
    approach: [
      "Segmenté la historia operacional por dureza, F80 y condición de revestimientos para construir comparaciones equivalentes.",
      "Relacioné potencia, presión de descansos, nivel de carga, velocidad y carga circulante con energía y estabilidad.",
      "Ejecuté pruebas escalonadas de carga de bolas y ventanas de granulometría, con criterios de detención acordados con Operaciones.",
      "Definí una matriz operacional por tipo de alimentación y la incorporé a la reunión diaria de planificación.",
    ],
    metrics: [
      { value: "−6,4 %", label: "energía específica" },
      { value: "+1,2 %", label: "tratamiento promedio" },
      { value: "−21 %", label: "eventos de sobrecarga" },
    ],
    results: [
      "La energía por tonelada disminuyó sin deteriorar el P80 enviado a flotación.",
      "La matriz redujo ajustes contradictorios y aceleró la respuesta frente a cambios de alimentación.",
      "El seguimiento separó el ahorro operacional del efecto natural del desgaste de revestimientos.",
    ],
    closing:
      "Normalizar por condición del mineral evitó atribuir mejoras al control cuando provenían de una alimentación más favorable. Esa disciplina hizo defendible y sostenible el resultado energético.",
    caseStudy: true,
    visualStyle: "energy",
  },
  {
    slug: "tablero-reporte-metalurgico-diario",
    title: "Tablero de reporte metalúrgico diario",
    category: "Analítica de datos",
    year: "2020",
    summary:
      "Automatización del reporte diario de metales y agua: de planillas manuales a un tablero Power BI con datos actualizados cada turno.",
    tags: ["Power BI", "Automatización", "Reportabilidad"],
    featured: false,
    duration: "8 semanas",
    context:
      "El reporte diario se construía copiando datos desde múltiples planillas. El proceso tomaba varias horas, era difícil de auditar y dejaba poco tiempo para explicar desviaciones metalúrgicas antes de la reunión de producción.",
    challenge:
      "Automatizar sin perder los controles que daban confianza al balance, unificar definiciones entre áreas y entregar una vista útil tanto para el turno como para la jefatura.",
    approach: [
      "Mapeé fuentes, responsables y reglas de cálculo; luego acordé un diccionario para tonelaje, leyes, inventarios y agua.",
      "Construí un flujo de transformación con validaciones de rango, completitud y cierre antes de publicar resultados.",
      "Diseñé el modelo y el tablero en Power BI con navegación desde indicadores ejecutivos hasta corrientes del balance.",
      "Implementé alertas de calidad y un registro de correcciones para mantener trazabilidad después del lanzamiento.",
    ],
    metrics: [
      { value: "−2,5 h", label: "preparación diaria" },
      { value: "3 turnos", label: "actualización de datos" },
      { value: "100 %", label: "indicadores con trazabilidad" },
    ],
    results: [
      "El equipo desplazó tiempo desde la transcripción hacia el análisis de pérdidas y causas.",
      "Las áreas pasaron a discutir indicadores calculados con la misma definición y período de corte.",
      "Las validaciones detectaron datos faltantes antes de que llegaran al informe oficial.",
    ],
    closing:
      "Automatizar un reporte no consiste en dibujar la planilla existente. El mayor avance fue hacer explícitas sus reglas y controles, para que la velocidad no redujera la confianza en el dato.",
    caseStudy: true,
    visualStyle: "dashboard",
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
