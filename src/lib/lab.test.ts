import { describe, expect, it } from "vitest";
import {
  flotationRecovery,
  massPull,
  pointInPolygon,
  timeToFraction,
  twoProductRecovery,
} from "./lab";

describe("cinética de flotación", () => {
  it("en t = 0 la recuperación es cero", () => {
    expect(flotationRecovery(0, 92, 1.2)).toBe(0);
  });

  it("con t → ∞ la recuperación tiende a R∞", () => {
    expect(flotationRecovery(1000, 92, 1.2)).toBeCloseTo(92, 5);
  });

  it("es monótona creciente", () => {
    let previous = -1;
    for (let t = 0; t <= 20; t += 1) {
      const value = flotationRecovery(t, 90, 0.8);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });

  it("respeta el modelo R(t) = R∞·(1 − e^(−kt))", () => {
    expect(flotationRecovery(10, 92, 1.2)).toBeCloseTo(92 * (1 - Math.exp(-1.2 * 10)), 10);
  });
});

describe("tiempo hasta una fracción de R∞", () => {
  it("el 90 % se alcanza en ln(10)/k", () => {
    expect(timeToFraction(0.9, 1.2)).toBeCloseTo(Math.LN10 / 1.2, 10);
  });

  it("el 100 % requiere tiempo infinito (asíntota)", () => {
    expect(timeToFraction(1, 1)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("fórmula de dos productos", () => {
  it("calcula la recuperación con leyes típicas", () => {
    const r = twoProductRecovery(0.8, 28, 0.12);
    expect(r).not.toBeNull();
    // R = 28·(0,68) / [0,8·(27,88)] · 100 ≈ 85,37 %
    expect(r).toBeCloseTo(85.37, 2);
  });

  it("calcula la extracción de masa (mass pull)", () => {
    const pull = massPull(0.8, 28, 0.12);
    expect(pull).not.toBeNull();
    expect(pull).toBeCloseTo(2.44, 2);
  });

  it("cierra el balance: Cu alimentado = Cu concentrado + Cu relave", () => {
    const f = 0.9;
    const c = 25;
    const t = 0.15;
    const pull = massPull(f, c, t) ?? 0;
    // Cu por unidad de masa de alimento
    const cuIn = f;
    const cuOut = (pull / 100) * c + (1 - pull / 100) * t;
    expect(cuOut).toBeCloseTo(cuIn, 10);
  });

  it("devuelve null con leyes incoherentes", () => {
    expect(twoProductRecovery(1, 0.5, 0.2)).toBeNull(); // c < f
    expect(twoProductRecovery(0.2, 1, 0.5)).toBeNull(); // f < t
    expect(massPull(1, 1, 1)).toBeNull();
  });
});

describe("punto en polígono (diagrama Eh-pH)", () => {
  const cuadrado: [number, number][] = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
  ];

  it("detecta puntos internos y externos", () => {
    expect(pointInPolygon(5, 5, cuadrado)).toBe(true);
    expect(pointInPolygon(15, 5, cuadrado)).toBe(false);
    expect(pointInPolygon(-1, -1, cuadrado)).toBe(false);
  });

  it("funciona con polígonos no convexos", () => {
    const l: [number, number][] = [
      [0, 0],
      [4, 0],
      [4, 4],
      [2, 2],
      [0, 4],
    ];
    // cuerpo del pentágono (bajo el hueco)
    expect(pointInPolygon(3, 2.5, l)).toBe(true);
    expect(pointInPolygon(1, 2.5, l)).toBe(true);
    // hueco superior (sobre las aristas que bajan hacia (2,2))
    expect(pointInPolygon(3, 3.5, l)).toBe(false);
    expect(pointInPolygon(1, 3.5, l)).toBe(false);
    expect(pointInPolygon(2, 3, l)).toBe(false);
  });
});
