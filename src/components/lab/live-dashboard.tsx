"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Instrumentación virtual de planta: seis métricas operacionales simuladas
 * con reversión a la media + ruido, actualizadas cada segundo.
 * Sparklines SVG dibujados a mano.
 */

type MetricDef = {
  key: string;
  label: string;
  unit: string;
  base: number;
  spread: number;
  decimals: number;
};

const METRICS: MetricDef[] = [
  { key: "tonelaje", label: "Tonelaje tratado", unit: "t/h", base: 4200, spread: 160, decimals: 0 },
  { key: "p80", label: "P80 molienda", unit: "µm", base: 148, spread: 7, decimals: 0 },
  { key: "ley", label: "Ley cabeza", unit: "% Cu", base: 0.82, spread: 0.05, decimals: 2 },
  { key: "rec", label: "Recuperación", unit: "%", base: 89.2, spread: 0.6, decimals: 1 },
  { key: "conc", label: "Ley concentrado", unit: "% Cu", base: 27.4, spread: 0.7, decimals: 1 },
  { key: "agua", label: "Consumo de agua", unit: "m³/h", base: 312, spread: 14, decimals: 0 },
];

const HISTORY = 60;

function initialSeries(): Record<string, number[]> {
  const series: Record<string, number[]> = {};
  for (const metric of METRICS) {
    series[metric.key] = Array.from(
      { length: HISTORY },
      () => metric.base + (Math.random() - 0.5) * metric.spread,
    );
  }
  return series;
}

function Sparkline({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map(
      (value, index) =>
        `${((index / (values.length - 1)) * 120).toFixed(1)},${(32 - ((value - min) / range) * 28).toFixed(1)}`,
    )
    .join(" ");

  return (
    <svg viewBox="0 0 120 36" className="h-9 w-full" aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LiveDashboard() {
  const [running, setRunning] = useState(true);
  const [series, setSeries] = useState<Record<string, number[]>>(initialSeries);
  const [ticks, setTicks] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setSeries((previous) => {
        const next: Record<string, number[]> = {};
        for (const metric of METRICS) {
          const values = previous[metric.key];
          const last = values[values.length - 1];
          const value =
            last + (metric.base - last) * 0.08 + (Math.random() - 0.5) * metric.spread * 0.7;
          next[metric.key] = [...values.slice(1), value];
        }
        return next;
      });
      setTicks((t) => t + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  return (
    <div className="border border-line bg-bg">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <div className="flex items-center gap-3">
          <span
            className={`size-2 rounded-full ${running ? "animate-pulse bg-accent" : "bg-muted"}`}
            aria-hidden
          />
          <p className="text-sm">
            {running ? "Transmitiendo" : "En pausa"}
            <span className="ml-2 text-xs text-muted">{ticks} lecturas</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRunning((value) => !value)}
          className="border border-line px-4 py-1.5 text-xs transition-colors hover:border-accent hover:text-accent"
        >
          {running ? "Pausar" : "Reanudar"}
        </button>
      </div>

      <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((metric) => {
          const values = series[metric.key];
          const current = values[values.length - 1];
          const tenAgo = values[values.length - 11] ?? current;
          const delta = current - tenAgo;

          return (
            <div key={metric.key} className="bg-bg p-5">
              <p className="text-xs tracking-wider text-muted uppercase">{metric.label}</p>
              <p className="mt-2 font-serif text-3xl">
                {current.toLocaleString("es-CL", {
                  minimumFractionDigits: metric.decimals,
                  maximumFractionDigits: metric.decimals,
                })}
                <span className="ml-1.5 text-sm text-muted">{metric.unit}</span>
              </p>
              <Sparkline values={values} />
              <p className={`text-xs ${delta >= 0 ? "text-accent" : "text-muted"}`}>
                {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(metric.decimals)} {metric.unit}{" "}
                vs. hace 10 s
              </p>
            </div>
          );
        })}
      </div>

      <p className="border-t border-line bg-surface px-6 py-3 text-xs text-muted">
        Datos simulados (reversión a la media + ruido). No corresponde a una planta real.
      </p>
    </div>
  );
}
