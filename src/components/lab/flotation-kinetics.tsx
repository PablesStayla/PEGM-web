"use client";

import { useMemo, useState } from "react";
import { flotationRecovery, timeToFraction } from "@/lib/lab";

/**
 * Simulador de cinética de flotación (modelo de primer orden).
 * R(t) = R∞ · (1 − e^(−k·t))
 * Gráfico SVG construido a mano, sin librerías.
 * La matemática vive en src/lib/lab.ts (probada con Vitest).
 */

const W = 640;
const H = 320;
const M = { top: 24, right: 24, bottom: 40, left: 52 };
const T_MAX = 20; // minutos

export function FlotationKinetics() {
  const [rInf, setRInf] = useState(92);
  const [k, setK] = useState(1.2);

  const x = (t: number) => M.left + (t / T_MAX) * (W - M.left - M.right);
  const y = (r: number) => H - M.bottom - (r / 100) * (H - M.top - M.bottom);

  const points = useMemo(() => {
    const list: { t: number; r: number }[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = (i / 80) * T_MAX;
      list.push({ t, r: flotationRecovery(t, rInf, k) });
    }
    return list;
  }, [rInf, k]);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)},${y(p.r).toFixed(1)}`)
    .join(" ");
  const area = `${path} L${x(T_MAX).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;

  const r10 = rInf * (1 - Math.exp(-k * 10));
  const t90 = timeToFraction(0.9, k);
  const t90Clamped = Math.min(t90, T_MAX);

  return (
    <div className="border border-line bg-bg">
      {/* Controles */}
      <div className="grid gap-6 border-b border-line p-6 sm:grid-cols-2">
        <label className="block">
          <span className="flex items-baseline justify-between text-sm">
            <span className="font-medium">Recuperación máxima R∞</span>
            <span className="font-serif text-accent">{rInf.toFixed(0)} %</span>
          </span>
          <input
            type="range"
            min={40}
            max={98}
            step={1}
            value={rInf}
            onChange={(e) => setRInf(Number(e.target.value))}
            className="mt-3 w-full accent-accent"
          />
        </label>
        <label className="block">
          <span className="flex items-baseline justify-between text-sm">
            <span className="font-medium">Constante de velocidad k</span>
            <span className="font-serif text-accent">{k.toFixed(2)} min⁻¹</span>
          </span>
          <input
            type="range"
            min={0.1}
            max={3}
            step={0.05}
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            className="mt-3 w-full accent-accent"
          />
        </label>
      </div>

      {/* Gráfico */}
      <div className="p-4 sm:p-6">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Curva de recuperación de flotación en el tiempo"
          className="w-full text-ink"
        >
          {/* rejilla */}
          {[0, 25, 50, 75, 100].map((r) => (
            <g key={r}>
              <line
                x1={x(0)}
                y1={y(r)}
                x2={x(T_MAX)}
                y2={y(r)}
                stroke="var(--color-line)"
                strokeWidth="1"
              />
              <text
                x={x(0) - 8}
                y={y(r) + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--color-muted)"
              >
                {r}
              </text>
            </g>
          ))}
          {[0, 5, 10, 15, 20].map((t) => (
            <text
              key={t}
              x={x(t)}
              y={H - M.bottom + 20}
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-muted)"
            >
              {t}
            </text>
          ))}
          <text
            x={(W - M.left - M.right) / 2 + M.left}
            y={H - 4}
            textAnchor="middle"
            fontSize="11"
            fill="var(--color-muted)"
          >
            tiempo de flotación (min)
          </text>
          <text
            x={14}
            y={M.top + (H - M.top - M.bottom) / 2}
            fontSize="11"
            fill="var(--color-muted)"
            transform={`rotate(-90 14 ${M.top + (H - M.top - M.bottom) / 2})`}
            textAnchor="middle"
          >
            recuperación (%)
          </text>

          {/* área bajo la curva */}
          <path d={area} fill="var(--color-accent)" opacity="0.08" />

          {/* asíntota R∞ */}
          <line
            x1={x(0)}
            y1={y(rInf)}
            x2={x(T_MAX)}
            y2={y(rInf)}
            stroke="var(--color-muted)"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text
            x={x(T_MAX) - 4}
            y={y(rInf) - 6}
            textAnchor="end"
            fontSize="11"
            fill="var(--color-muted)"
          >
            R∞ = {rInf.toFixed(0)} %
          </text>

          {/* marcador en t = 10 min */}
          <line
            x1={x(10)}
            y1={y(r10)}
            x2={x(10)}
            y2={y(0)}
            stroke="var(--color-line)"
            strokeDasharray="3 3"
          />
          <circle cx={x(10)} cy={y(r10)} r="4" fill="var(--color-accent)" />
          <text x={x(10) + 8} y={y(r10) - 8} fontSize="11" fill="var(--color-accent)">
            R(10) = {r10.toFixed(1)} %
          </text>

          {/* curva */}
          <path
            d={path}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Lecturas */}
      <div className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-3">
        <div className="bg-bg p-4 text-center">
          <p className="font-serif text-2xl text-accent">{r10.toFixed(1)} %</p>
          <p className="mt-1 text-xs text-muted">Recuperación a 10 min</p>
        </div>
        <div className="bg-bg p-4 text-center">
          <p className="font-serif text-2xl text-accent">
            {t90Clamped >= T_MAX ? "> 20" : t90.toFixed(1)} min
          </p>
          <p className="mt-1 text-xs text-muted">Tiempo hasta 90 % de R∞</p>
        </div>
        <div className="hidden bg-bg p-4 text-center sm:block">
          <p className="font-serif text-2xl text-accent">
            {((1 - Math.exp(-k * 10)) * 100).toFixed(0)} %
          </p>
          <p className="mt-1 text-xs text-muted">% de R∞ alcanzado a 10 min</p>
        </div>
      </div>
    </div>
  );
}
