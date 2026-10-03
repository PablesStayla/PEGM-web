"use client";

import { useRef, useState } from "react";
import { pointInPolygon } from "@/lib/lab";

/**
 * Diagrama Eh-pH (Pourbaix) del sistema Cu-H₂O.
 * Construido con fronteras termodinámicas aproximadas (25 °C, a_Cu²⁺ = 10⁻⁶):
 *
 *   Cu²⁺/Cu:    E = 0,160 V
 *   Cu²⁺/Cu₂O:  E = −0,153 + 0,059·pH
 *   Cu/Cu₂O:    E = 0,472 − 0,059·pH
 *   Cu₂O/CuO:   E = 0,641 − 0,059·pH
 *   Cu²⁺/CuO:   pH ≈ 6,7
 *
 * Incluye retícula interactiva (crosshair) y detección de la especie
 * dominante mediante test punto-en-polígono.
 */

const W = 680;
const H = 520;
const M = { top: 24, right: 24, bottom: 44, left: 60 };
const PH_MAX = 14;
const E_MIN = -1.5;
const E_MAX = 1.8;

type Region = {
  name: string;
  formula: string;
  description: string;
  poly: [number, number][]; // [pH, E]
  fill: string;
  labelAt: [number, number];
};

const REGIONS: Region[] = [
  {
    name: "Cobre metálico",
    formula: "Cu",
    description: "Cobre reducido. Zona de condiciones reductoras.",
    poly: [
      [0, 0.16],
      [5.27, 0.16],
      [14, -0.354],
      [14, E_MIN],
      [0, E_MIN],
    ],
    fill: "#8d8578",
    labelAt: [2.4, -0.85],
  },
  {
    name: "Ion cúprico",
    formula: "Cu²⁺",
    description: "Cobre disuelto: zona de lixiviación ácida y oxidante.",
    poly: [
      [0, E_MAX],
      [6.7, E_MAX],
      [6.7, 0.243],
      [5.27, 0.16],
      [0, 0.16],
    ],
    fill: "#5e93a4",
    labelAt: [2.6, 1.05],
  },
  {
    name: "Cuprita",
    formula: "Cu₂O",
    description: "Óxido cuproso, estable entre el metal y el CuO.",
    poly: [
      [5.27, 0.16],
      [6.73, 0.245],
      [14, -0.185],
      [14, -0.354],
    ],
    fill: "#c98d5f",
    labelAt: [10.4, -0.1],
  },
  {
    name: "Tenorita",
    formula: "CuO",
    description: "Óxido cúprico, dominante en medios alcalinos oxidantes.",
    poly: [
      [6.7, 0.243],
      [6.7, E_MAX],
      [14, E_MAX],
      [14, -0.185],
    ],
    fill: "#9c4a1a",
    labelAt: [10.4, 1.0],
  },
];

const WATER_O2: [number, number][] = [
  [0, 1.229],
  [14, 0.402],
];
const WATER_H2: [number, number][] = [
  [0, 0],
  [14, -0.827],
];

function x(pH: number) {
  return M.left + (pH / PH_MAX) * (W - M.left - M.right);
}
function y(E: number) {
  return H - M.bottom - ((E - E_MIN) / (E_MAX - E_MIN)) * (H - M.top - M.bottom);
}
function toPolyStr(poly: [number, number][]) {
  return poly.map(([pH, E]) => `${x(pH).toFixed(1)},${y(E).toFixed(1)}`).join(" ");
}
function linePath(poly: [number, number][]) {
  return poly
    .map(([pH, E], i) => `${i === 0 ? "M" : "L"}${x(pH).toFixed(1)},${y(E).toFixed(1)}`)
    .join(" ");
}

function pointInPoly(pH: number, E: number, poly: [number, number][]) {
  return pointInPolygon(pH, E, poly);
}

export function Pourbaix() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState<{ pH: number; E: number } | null>(null);

  const dominant = cursor
    ? (REGIONS.find((r) => pointInPoly(cursor.pH, cursor.E, r.poly)) ?? null)
    : null;

  function handleMove(event: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * W;
    const py = ((event.clientY - rect.top) / rect.height) * H;

    const pH = ((px - M.left) / (W - M.left - M.right)) * PH_MAX;
    const E = E_MAX - ((py - M.top) / (H - M.top - M.bottom)) * (E_MAX - E_MIN);

    if (pH < -0.5 || pH > 14.5 || E < E_MIN - 0.2 || E > E_MAX + 0.2) {
      setCursor(null);
      return;
    }
    setCursor({
      pH: Math.min(Math.max(pH, 0), 14),
      E: Math.min(Math.max(E, E_MIN), E_MAX),
    });
  }

  const info = dominant;

  return (
    <div className="border border-line bg-bg">
      <div className="relative p-4 sm:p-6">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Diagrama Eh-pH del sistema cobre-agua"
          className="w-full text-ink"
          onMouseMove={handleMove}
          onMouseLeave={() => setCursor(null)}
        >
          {/* regiones */}
          {REGIONS.map((region) => (
            <polygon
              key={region.formula}
              points={toPolyStr(region.poly)}
              fill={region.fill}
              fillOpacity={dominant?.formula === region.formula ? 0.4 : 0.18}
              stroke={dominant?.formula === region.formula ? "var(--color-accent)" : "transparent"}
              strokeWidth="2"
              className="cursor-crosshair"
            />
          ))}

          {/* líneas de estabilidad del agua */}
          {[WATER_O2, WATER_H2].map((line) => (
            <path
              key={line[0][1]}
              d={linePath(line)}
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth="1.2"
              strokeDasharray="6 4"
              opacity="0.8"
            />
          ))}
          <text
            x={x(13.6)}
            y={y(1.229 - 0.0591 * 13.6) - 8}
            fontSize="10"
            textAnchor="end"
            fill="var(--color-muted)"
          >
            O₂/H₂O
          </text>
          <text
            x={x(13.6)}
            y={y(-0.0591 * 13.6) - 8}
            fontSize="10"
            textAnchor="end"
            fill="var(--color-muted)"
          >
            H₂O/H₂
          </text>

          {/* etiquetas de regiones */}
          {REGIONS.map((region) => (
            <text
              key={`label-${region.formula}`}
              x={x(region.labelAt[0])}
              y={y(region.labelAt[1])}
              fontSize="15"
              fontWeight="600"
              textAnchor="middle"
              fill="var(--color-ink)"
              className="pointer-events-none select-none"
            >
              {region.formula}
            </text>
          ))}

          {/* ejes */}
          {[0, 2, 4, 6, 8, 10, 12, 14].map((pH) => (
            <text
              key={pH}
              x={x(pH)}
              y={H - M.bottom + 20}
              fontSize="11"
              textAnchor="middle"
              fill="var(--color-muted)"
            >
              {pH}
            </text>
          ))}
          {[-1, 0, 1].map((E) => (
            <text
              key={E}
              x={M.left - 8}
              y={y(E) + 4}
              fontSize="11"
              textAnchor="end"
              fill="var(--color-muted)"
            >
              {E.toFixed(1)}
            </text>
          ))}
          <text
            x={M.left + (W - M.left - M.right) / 2}
            y={H - 6}
            fontSize="11"
            textAnchor="middle"
            fill="var(--color-muted)"
          >
            pH
          </text>
          <text
            x={16}
            y={M.top + (H - M.top - M.bottom) / 2}
            fontSize="11"
            textAnchor="middle"
            fill="var(--color-muted)"
            transform={`rotate(-90 16 ${M.top + (H - M.top - M.bottom) / 2})`}
          >
            E (V vs SHE)
          </text>

          {/* retícula */}
          {cursor ? (
            <g className="pointer-events-none">
              <line
                x1={x(cursor.pH)}
                y1={M.top}
                x2={x(cursor.pH)}
                y2={H - M.bottom}
                stroke="var(--color-accent)"
                strokeWidth="0.8"
                strokeDasharray="3 3"
              />
              <line
                x1={M.left}
                y1={y(cursor.E)}
                x2={W - M.right}
                y2={y(cursor.E)}
                stroke="var(--color-accent)"
                strokeWidth="0.8"
                strokeDasharray="3 3"
              />
              <circle cx={x(cursor.pH)} cy={y(cursor.E)} r="4" fill="var(--color-accent)" />
            </g>
          ) : null}
        </svg>

        {/* lectura del cursor */}
        {cursor ? (
          <div className="absolute top-6 right-6 border border-line bg-bg/95 px-3 py-2 text-xs shadow-sm">
            <p className="text-muted">
              pH <span className="font-medium text-ink">{cursor.pH.toFixed(1)}</span> · E{" "}
              <span className="font-medium text-ink">{cursor.E.toFixed(2)} V</span>
            </p>
            {dominant ? (
              <p className="mt-1 text-accent">
                {dominant.name} ({dominant.formula})
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* detalle de la región */}
      <div className="border-t border-line bg-surface px-6 py-4 text-sm text-muted">
        {info ? (
          <p>
            <span className="font-medium text-ink">
              {info.name} ({info.formula})
            </span>{" "}
            — {info.description}
          </p>
        ) : (
          <p>Pasa el cursor por el diagrama para leer condiciones Eh-pH y la especie dominante.</p>
        )}
      </div>
    </div>
  );
}
