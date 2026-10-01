"use client";

import { useState } from "react";

/**
 * Calculadora de balance de masa (fórmula de dos productos).
 * Recuperación R = c·(f − t) / [f·(c − t)] · 100
 * Incluye un mini-diagrama de flujo (Sankey) en SVG.
 */

export function MassBalance() {
  const [feed, setFeed] = useState(0.8);
  const [conc, setConc] = useState(28);
  const [tail, setTail] = useState(0.12);

  const valid = conc > feed && feed > tail;

  const recovery = valid
    ? ((conc * (feed - tail)) / (feed * (conc - tail))) * 100
    : null;
  const pull = valid ? ((feed - tail) / (conc - tail)) * 100 : null;

  // geometría del Sankey
  const feedW = 44;
  const concW = pull ? Math.max((feedW * pull) / 100, 4) : 8;
  const tailW = pull ? Math.max(feedW - concW, 4) : 36;
  const yFeed = 150;
  const yConc = 62;
  const yTail = 238;
  const x0 = 128;
  const x1 = 330;
  const x2 = 520;

  const input =
    "w-full border border-line bg-bg px-3 py-2 text-sm outline-none transition-colors focus:border-accent";

  return (
    <div className="border border-line bg-bg">
      <div className="grid gap-6 border-b border-line p-6 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">
            Ley alimentación f
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={feed}
              onChange={(e) => setFeed(Number(e.target.value))}
              className={input}
            />
            <span className="text-xs text-muted">% Cu</span>
          </div>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">
            Ley concentrado c
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={conc}
              onChange={(e) => setConc(Number(e.target.value))}
              className={input}
            />
            <span className="text-xs text-muted">% Cu</span>
          </div>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Ley relave t</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={tail}
              onChange={(e) => setTail(Number(e.target.value))}
              className={input}
            />
            <span className="text-xs text-muted">% Cu</span>
          </div>
        </label>
      </div>

      <div className="p-4 sm:p-6">
        {valid ? (
          <svg
            viewBox="0 0 640 300"
            role="img"
            aria-label="Diagrama de flujo de masa del circuito"
            className="w-full text-ink"
          >
            {/* alimentación → planta */}
            <line
              x1={x0}
              y1={yFeed}
              x2={x1}
              y2={yFeed}
              stroke="var(--color-muted)"
              strokeWidth={feedW}
              opacity="0.55"
            />
            {/* planta → concentrado */}
            <path
              d={`M ${x1} ${yFeed} C ${x1 + 90} ${yFeed}, ${x2 - 90} ${yConc}, ${x2} ${yConc}`}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={concW}
              opacity="0.85"
            />
            {/* planta → relave */}
            <path
              d={`M ${x1} ${yFeed} C ${x1 + 90} ${yFeed}, ${x2 - 90} ${yTail}, ${x2} ${yTail}`}
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth={tailW}
              opacity="0.35"
            />

            {/* planta */}
            <rect
              x={x1 - 10}
              y={yFeed - 56}
              width="20"
              height="112"
              fill="var(--color-surface)"
              stroke="var(--color-line)"
            />
            <text
              x={x1}
              y={yFeed + 4}
              fontSize="10"
              textAnchor="middle"
              fill="var(--color-muted)"
              transform={`rotate(-90 ${x1} ${yFeed + 4})`}
            >
              CIRCUITO
            </text>

            {/* etiquetas */}
            <text x={x0 - 8} y={yFeed - feedW / 2 - 10} fontSize="12" textAnchor="end" fontWeight="600">
              Alimentación
            </text>
            <text x={x0 - 8} y={yFeed - feedW / 2 + 6} fontSize="11" textAnchor="end" fill="var(--color-muted)">
              100 % masa · {feed.toFixed(2)} % Cu
            </text>
            <text x={x2 + 8} y={yConc - concW / 2 - 10} fontSize="12" fontWeight="600">
              Concentrado
            </text>
            <text x={x2 + 8} y={yConc - concW / 2 + 6} fontSize="11" fill="var(--color-muted)">
              {pull!.toFixed(1)} % masa · {conc.toFixed(2)} % Cu
            </text>
            <text x={x2 + 8} y={yTail - tailW / 2 - 10} fontSize="12" fontWeight="600">
              Relave
            </text>
            <text x={x2 + 8} y={yTail - tailW / 2 + 6} fontSize="11" fill="var(--color-muted)">
              {(100 - pull!).toFixed(1)} % masa · {tail.toFixed(2)} % Cu
            </text>
          </svg>
        ) : (
          <p className="border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
            Las leyes deben cumplir c &gt; f &gt; t (concentrado más rico que la
            alimentación y esta más rica que el relave).
          </p>
        )}
      </div>

      {valid ? (
        <div className="grid grid-cols-2 gap-px border-t border-line bg-line">
          <div className="bg-bg p-4 text-center">
            <p className="font-serif text-3xl text-accent">
              {recovery!.toFixed(1)} %
            </p>
            <p className="mt-1 text-xs text-muted">
              Recuperación R = c(f−t) / f(c−t)
            </p>
          </div>
          <div className="bg-bg p-4 text-center">
            <p className="font-serif text-3xl text-accent">
              {pull!.toFixed(1)} %
            </p>
            <p className="mt-1 text-xs text-muted">
              Extracción de masa (mass pull)
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
