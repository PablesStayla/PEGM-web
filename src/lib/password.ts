import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Hash de contraseñas con scrypt (módulo nativo de Node, sin dependencias).
 * Versión asíncrona: no bloquea el event loop del servidor.
 * Formato almacenado: "<salt-hex>:<clave-hex>"
 */

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;

  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(key, "hex");
  if (derived.length !== expected.length) return false;

  return timingSafeEqual(derived, expected);
}
