/**
 * Matemática metalúrgica pura, usada por las herramientas del laboratorio.
 * Funciones sin dependencias de React para poder probarlas con Vitest.
 */

/** Cinética de flotación de primer orden: R(t) = R∞ · (1 − e^(−k·t)) */
export function flotationRecovery(t: number, rInf: number, k: number): number {
  return rInf * (1 - Math.exp(-k * t));
}

/** Tiempo para alcanzar una fracción de R∞: t = −ln(1 − f) / k */
export function timeToFraction(fraction: number, k: number): number {
  return -Math.log(1 - fraction) / k;
}

/**
 * Fórmula de dos productos (recuperación):
 * R = c·(f − t) / [f·(c − t)] · 100
 * Devuelve null si las leyes no cumplen c > f > t.
 */
export function twoProductRecovery(f: number, c: number, t: number): number | null {
  if (!(c > f && f > t)) return null;
  return ((c * (f - t)) / (f * (c - t))) * 100;
}

/** Extracción de masa (mass pull): (f − t)/(c − t) · 100 */
export function massPull(f: number, c: number, t: number): number | null {
  if (!(c > f && f > t)) return null;
  return ((f - t) / (c - t)) * 100;
}

/** Test punto-en-polígono (ray casting), usado por el diagrama Eh-pH. */
export function pointInPolygon(x: number, y: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}
