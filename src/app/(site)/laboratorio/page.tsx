import type { Metadata } from "next";
import { FlotationKinetics } from "@/components/lab/flotation-kinetics";
import { LiveDashboard } from "@/components/lab/live-dashboard";
import { MassBalance } from "@/components/lab/mass-balance";
import { Pourbaix } from "@/components/lab/pourbaix";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Laboratorio",
  description:
    "Herramientas metalúrgicas interactivas: cinética de flotación, balance de masa, diagrama Eh-pH del cobre e instrumentación virtual de planta. Programadas desde cero.",
};

const TOOLS = [
  {
    id: "flotacion",
    label: "01 · Flotación",
    title: "Cinética de flotación",
    description:
      "El modelo clásico de primer orden R(t) = R∞·(1 − e^(−kt)), con controles para la recuperación máxima y la constante de velocidad. La curva, el área y los marcadores se recalculan en cada cambio.",
    stack: "React · SVG · modelo de primer orden",
  },
  {
    id: "balance",
    label: "02 · Balance de masa",
    title: "Fórmula de dos productos",
    description:
      "La herramienta de todos los días del metalúrgico de planta: recuperación y extracción de masa a partir de las leyes de alimentación, concentrado y relave, con un diagrama de flujo proporcional a la masa.",
    stack: "React · SVG · Sankey simplificado",
  },
  {
    id: "pourbaix",
    label: "03 · Termodinámica",
    title: "Diagrama Eh-pH del cobre",
    description:
      "Diagrama de Pourbaix del sistema Cu-H₂O construido con las fronteras termodinámicas de Nernst (25 °C, a_Cu²⁺ = 10⁻⁶). Incluye retícula de lectura y detección de la especie dominante con test punto-en-polígono.",
    stack: "React · SVG · Nernst · punto-en-polígono",
  },
  {
    id: "planta",
    label: "04 · Instrumentación",
    title: "Planta en vivo",
    description:
      "Seis métricas operacionales simuladas con reversión a la media y ruido, actualizándose cada segundo, con sparklines y comparación contra 10 segundos atrás. El tipo de tablero que construí para reporte metalúrgico diario.",
    stack: "React · series de tiempo · SVG",
  },
];

export default function LabPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
      <p className="text-xs font-medium tracking-[0.25em] text-accent uppercase">
        Ingeniería + código
      </p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight md:text-6xl">
        Laboratorio<span className="text-accent">.</span>
      </h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-muted">
        Cuatro herramientas metalúrgicas interactivas que programé para este sitio{" "}
        <strong className="text-ink">desde cero</strong>: sin librerías de gráficos, sin plantillas.
        Cada componente demuestra que la programación es parte de mi caja de herramientas
        profesional.
      </p>

      <div className="mt-16 space-y-20 border-t border-line pt-16">
        {TOOLS.map((tool, index) => (
          <Reveal key={tool.id}>
            <section id={tool.id} className="scroll-mt-24">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
                    {tool.label}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl tracking-tight">{tool.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{tool.description}</p>
                </div>
                <p className="border border-line px-3 py-1.5 font-mono text-[11px] text-muted">
                  {tool.stack}
                </p>
              </div>

              {index === 0 ? <FlotationKinetics /> : null}
              {index === 1 ? <MassBalance /> : null}
              {index === 2 ? <Pourbaix /> : null}
              {index === 3 ? <LiveDashboard /> : null}
            </section>
          </Reveal>
        ))}
      </div>

      <p className="mt-16 border-t border-line pt-8 text-xs leading-relaxed text-muted">
        Nota técnica: los diagramas usan constantes termodinámicas aproximadas con fines
        ilustrativos. Para estudios de proceso, la fuente de verdad sigue siendo la literatura
        (Pourbaix, 1974; Hayes, 2003) y los datos de planta.
      </p>
    </div>
  );
}
