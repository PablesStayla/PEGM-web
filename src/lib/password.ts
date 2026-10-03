import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Hash de contraseñas con scrypt (módulo nativo de Node, sin dependencias).
 * Formato almacenado: "<salt-hex>:<clave-hex>"
 */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${key}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;

  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(key, "hex");
  if (derived.length !== expected.length) return false;

  return timingSafeEqual(derived, expected);
}
