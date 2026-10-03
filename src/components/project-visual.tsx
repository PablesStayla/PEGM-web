type ProjectVisualProps = {
  style: string;
  title: string;
};

const labels: Record<string, { title: string; caption: string }> = {
  flotation: {
    title: "Esquema del circuito y curva de recuperación",
    caption:
      "Visualización conceptual del trabajo: diagnóstico por etapa, ajuste de variables y estabilización del circuito.",
  },
  prediction: {
    title: "Horizonte predictivo de la ley de cabeza",
    caption:
      "Comparación conceptual entre la señal observada y la predicción disponible seis horas antes.",
  },
  hydrometallurgy: {
    title: "Balance integrado del circuito SX-EW",
    caption:
      "Esquema de las corrientes reconciliadas y de los escenarios usados para localizar restricciones.",
  },
  feasibility: {
    title: "Ruta de decisión de prefactibilidad",
    caption:
      "Secuencia de trabajo desde las bases de diseño hasta la recomendación técnico-económica.",
  },
  energy: {
    title: "Normalización del desempeño energético",
    caption:
      "Representación conceptual de la comparación antes/después bajo condiciones equivalentes de alimentación.",
  },
  dashboard: {
    title: "Arquitectura del reporte metalúrgico",
    caption:
      "Flujo desde las fuentes operacionales hasta indicadores validados y trazables por turno.",
  },
  process: {
    title: "Flujo de trabajo del proyecto",
    caption: "Diagnóstico, diseño, validación y transferencia operacional como ciclo de mejora.",
  },
};

const text = "fill-current font-sans text-[15px]";
const smallText = "fill-current font-sans text-[12px] tracking-wide";
const box = "fill-bg stroke-line";

function FlotationVisual() {
  return (
    <>
      <g className="text-muted" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M80 184H218M338 184H452M572 184H690" />
        <path d="m207 177 11 7-11 7M441 177l11 7-11 7M679 177l11 7-11 7" />
        <path d="M512 130V88H278v40" strokeDasharray="6 6" />
      </g>
      {[
        [40, 128, 170, 112, "Alimentación", "Caracterización"],
        [218, 128, 120, 112, "Rougher", "Estabilidad"],
        [452, 128, 120, 112, "Scavenger", "Pérdidas"],
        [690, 128, 190, 112, "Concentrado", "Calidad"],
      ].map(([x, y, width, height, label, note]) => (
        <g key={String(label)}>
          <rect x={x} y={y} width={width} height={height} className={box} strokeWidth="2" />
          <text x={Number(x) + 18} y={Number(y) + 44} className={`text-ink ${text}`}>
            {label}
          </text>
          <text x={Number(x) + 18} y={Number(y) + 70} className={`text-muted ${smallText}`}>
            {note}
          </text>
        </g>
      ))}
      <g className="text-accent" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M80 344c118-82 202-93 292-51s172 3 248-45 148-37 260-16" />
        <circle cx="372" cy="293" r="5" fill="currentColor" />
        <circle cx="620" cy="248" r="5" fill="currentColor" />
      </g>
      <text x="80" y="382" className={`text-muted ${smallText}`}>
        RESPUESTA ACUMULADA · CAMPAÑA INDUSTRIAL
      </text>
      <text x="766" y="210" className={`text-accent ${smallText}`}>
        +2,1 pp
      </text>
    </>
  );
}

function PredictionVisual() {
  return (
    <>
      <g className="text-muted" fill="none" stroke="currentColor" strokeWidth="1.5">
        {[112, 184, 256, 328].map((y) => (
          <path key={y} d={`M72 ${y}H888`} opacity="0.35" />
        ))}
        {[72, 208, 344, 480, 616, 752, 888].map((x) => (
          <path key={x} d={`M${x} 80V352`} opacity="0.2" />
        ))}
      </g>
      <path
        d="M72 269c74-31 118-97 181-60s105 107 164 59 86-130 147-87 104 101 158 58 90-80 166-42"
        className="text-ink"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M72 287c66-35 125-88 184-50s97 93 156 50 94-117 151-77 99 87 155 52 98-70 170-43"
        className="text-accent"
        fill="none"
        stroke="currentColor"
        strokeDasharray="10 7"
        strokeWidth="3"
      />
      <g className="text-accent">
        <path d="M616 66v306" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="632" y="92" className={smallText}>
          AHORA
        </text>
        <path d="M632 116H860" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m850 109 10 7-10 7" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="695" y="142" className={text}>
          horizonte 6 h
        </text>
      </g>
      <g className="text-muted">
        <circle cx="92" cy="386" r="4" fill="currentColor" />
        <text x="106" y="391" className={smallText}>
          LEY OBSERVADA
        </text>
        <path d="M250 386h26" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="287" y="391" className={smallText}>
          PREDICCIÓN
        </text>
      </g>
    </>
  );
}

function HydrometallurgyVisual() {
  const stages = [
    [55, 138, 168, 100, "Lixiviación", "PLS"],
    [286, 138, 168, 100, "Extracción", "SX"],
    [517, 138, 168, 100, "Reextracción", "Electrolito"],
    [748, 138, 158, 100, "EW", "Cátodos"],
  ] as const;
  return (
    <>
      <g className="text-muted" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M223 188h63M454 188h63M685 188h63" />
        <path d="m275 181 11 7-11 7M506 181l11 7-11 7M737 181l11 7-11 7" />
        <path d="M827 238v86H139v-86" strokeDasharray="7 6" />
        <path d="m132 251 7-13 7 13" />
      </g>
      {stages.map(([x, y, width, height, label, note], index) => (
        <g key={label}>
          <rect x={x} y={y} width={width} height={height} className={box} strokeWidth="2" />
          <text x={x + 18} y={y + 42} className={`text-ink ${text}`}>
            {label}
          </text>
          <text x={x + 18} y={y + 68} className={`text-muted ${smallText}`}>
            {note}
          </text>
          <text x={x + width - 31} y={y + 29} className={`text-accent ${smallText}`}>
            0{index + 1}
          </text>
        </g>
      ))}
      <text x="382" y="353" className={`text-muted ${smallText}`}>
        RECIRCULACIÓN · AGUA · INVENTARIOS
      </text>
      <g className="text-accent">
        <text x="55" y="95" className={smallText}>
          BALANCE RECONCILIADO
        </text>
        <text x="748" y="95" className={text}>
          cierre &gt;98 %
        </text>
      </g>
    </>
  );
}

function FeasibilityVisual() {
  const steps = [
    [56, "Bases de diseño", "Supuestos y brechas"],
    [264, "Alternativas", "Proceso y equipos"],
    [472, "Evaluación", "Capex · Opex"],
    [680, "Decisión", "Caso recomendado"],
  ] as const;
  return (
    <>
      <path
        d="M122 210H838"
        className="text-line"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      {steps.map(([x, label, note], index) => (
        <g key={label}>
          <circle
            cx={x + 72}
            cy="210"
            r="32"
            className={index === 3 ? "fill-accent stroke-accent" : "fill-bg stroke-accent"}
            strokeWidth="2"
          />
          <text
            x={x + 72}
            y="216"
            textAnchor="middle"
            className={`${index === 3 ? "text-bg" : "text-accent"} ${text}`}
          >
            0{index + 1}
          </text>
          <text x={x} y="285" className={`text-ink ${text}`}>
            {label}
          </text>
          <text x={x} y="311" className={`text-muted ${smallText}`}>
            {note}
          </text>
        </g>
      ))}
      <rect x="56" y="72" width="824" height="54" className={box} strokeWidth="2" />
      <text x="80" y="106" className={`text-muted ${smallText}`}>
        SENSIBILIDAD · LEY · RECUPERACIÓN · PRECIO · TONELAJE · LOGÍSTICA
      </text>
      <text x="774" y="106" className={`text-accent ${smallText}`}>
        ±25 %
      </text>
    </>
  );
}

function EnergyVisual() {
  return (
    <>
      <g className="text-muted" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M88 78v276h790" />
        {[128, 202, 276, 350].map((y) => (
          <path key={y} d={`M88 ${y}h790`} opacity="0.25" />
        ))}
      </g>
      <path
        d="M106 154c65-30 111 60 173 15s105 68 169 13 106 49 166-8 105 39 166-25 70 6 98-17"
        className="text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M106 249c64-24 111 39 173 8s107 43 169 5 107 36 166-6 105 25 166-17 70 1 98-12"
        className="text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <g className="text-muted">
        <text x="106" y="102" className={smallText}>
          ENERGÍA ESPECÍFICA NORMALIZADA
        </text>
        <text x="108" y="390" className={smallText}>
          PERÍODOS OPERACIONALES COMPARABLES
        </text>
      </g>
      <g className="text-accent">
        <path d="M770 167v62" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m763 218 7 11 7-11" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="791" y="205" className={text}>
          −6,4 %
        </text>
      </g>
    </>
  );
}

function DashboardVisual() {
  return (
    <>
      <rect x="50" y="62" width="860" height="300" rx="4" className={box} strokeWidth="2" />
      <path
        d="M50 118h860M234 118v244"
        className="text-line"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <g className="text-muted">
        <circle cx="78" cy="90" r="6" fill="currentColor" opacity="0.4" />
        <circle cx="100" cy="90" r="6" fill="currentColor" opacity="0.4" />
        <circle cx="122" cy="90" r="6" fill="currentColor" opacity="0.4" />
        {[
          [78, 158, "BALANCE"],
          [78, 205, "PRODUCCIÓN"],
          [78, 252, "AGUA"],
          [78, 299, "CALIDAD"],
        ].map(([x, y, label]) => (
          <text key={String(label)} x={x} y={y} className={smallText}>
            {label}
          </text>
        ))}
      </g>
      {[
        [268, "Recuperación", "85,4 %"],
        [475, "Tratamiento", "4.820 t/h"],
        [682, "Cierre", "99,1 %"],
      ].map(([x, label, value]) => (
        <g key={label}>
          <rect x={x} y="148" width="174" height="82" className={box} strokeWidth="1.5" />
          <text x={Number(x) + 16} y="178" className={`text-muted ${smallText}`}>
            {label}
          </text>
          <text x={Number(x) + 16} y="210" className={`text-accent ${text}`}>
            {value}
          </text>
        </g>
      ))}
      <path
        d="M280 316c56-57 102 10 151-38s92 23 143-18 85 8 127-26 91 28 157-20"
        className="text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
    </>
  );
}

function ProcessVisual() {
  const steps = ["Diagnóstico", "Diseño", "Validación", "Transferencia"];
  return (
    <>
      {steps.map((step, index) => {
        const x = 70 + index * 220;
        return (
          <g key={step}>
            <rect x={x} y="145" width="160" height="110" className={box} strokeWidth="2" />
            <text x={x + 20} y="193" className={`text-ink ${text}`}>
              {step}
            </text>
            <text x={x + 20} y="221" className={`text-accent ${smallText}`}>
              0{index + 1}
            </text>
            {index < steps.length - 1 ? (
              <path
                d={`M${x + 160} 200h60m-11-7 11 7-11 7`}
                className="text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            ) : null}
          </g>
        );
      })}
    </>
  );
}

const visuals: Record<string, () => React.ReactNode> = {
  flotation: FlotationVisual,
  prediction: PredictionVisual,
  hydrometallurgy: HydrometallurgyVisual,
  feasibility: FeasibilityVisual,
  energy: EnergyVisual,
  dashboard: DashboardVisual,
  process: ProcessVisual,
};

export function ProjectVisualThumbnail({ style }: { style: string }) {
  const key = style in visuals ? style : "process";
  const Visual = visuals[key];

  return (
    <div className="overflow-hidden border border-line bg-surface" aria-hidden="true">
      <svg viewBox="0 40 960 340" className="h-auto w-full" focusable="false">
        <title>Visual técnico del proyecto</title>
        <Visual />
      </svg>
    </div>
  );
}

export function ProjectVisual({ style, title }: ProjectVisualProps) {
  const key = style in visuals ? style : "process";
  const Visual = visuals[key];
  const copy = labels[key];

  return (
    <figure className="border-b border-line bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
            Evidencia visual
          </p>
          <p className="hidden text-xs text-muted sm:block">Esquema técnico · no a escala</p>
        </div>
        <div className="overflow-hidden border border-line bg-bg p-3 sm:p-5">
          <svg
            viewBox="0 0 960 420"
            role="img"
            aria-label={`${copy.title} para ${title}`}
            className="h-auto w-full"
          >
            <Visual />
          </svg>
        </div>
        <figcaption className="mt-4 grid gap-1 sm:grid-cols-[15rem_1fr] sm:gap-8">
          <span className="font-serif text-sm text-ink">{copy.title}</span>
          <span className="text-xs leading-relaxed text-muted">{copy.caption}</span>
        </figcaption>
      </div>
    </figure>
  );
}
