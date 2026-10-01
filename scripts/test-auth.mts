/**
 * Prueba de integración de la cadena de autenticación:
 * 1. scrypt hash/verify (src/lib/password.ts)
 * 2. JWT firma/verificación (src/lib/auth.ts)
 * 3. Usuario sembrado en la base de datos + verificación del hash real
 *
 * Uso: node --experimental-strip-types scripts/test-auth.mts
 */
import Database from "better-sqlite3";
import { hashPassword, verifyPassword } from "../src/lib/password.ts";
import { createSessionToken, verifySessionToken } from "../src/lib/auth.ts";

let failures = 0;
function check(name: string, condition: boolean) {
  console.log(`${condition ? "✓" : "✗ FALLO"} — ${name}`);
  if (!condition) failures++;
}

// 1. scrypt
const hash = hashPassword("secreto-123");
check("hashPassword genera formato salt:clave", /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(hash));
check("verifyPassword acepta la contraseña correcta", verifyPassword("secreto-123", hash));
check("verifyPassword rechaza contraseña incorrecta", !verifyPassword("otra", hash));
check("verifyPassword rechaza hash corrupto", !verifyPassword("x", "formato-invalido"));

// 2. JWT
const token = await createSessionToken({ email: "test@p.cl", name: "Test" });
const payload = await verifySessionToken(token);
check("JWT verifica y devuelve el payload", payload?.email === "test@p.cl" && payload?.name === "Test");
check("JWT rechaza token alterado", (await verifySessionToken(`${token}x`)) === null);

// 3. Base de datos sembrada
const db = new Database("data/site.db");
const user = db.prepare("SELECT email, name, password_hash FROM users LIMIT 1").get() as
  | { email: string; name: string; password_hash: string }
  | undefined;

check("existe un usuario administrador sembrado", Boolean(user));
if (user) {
  check(`la contraseña por defecto funciona para ${user.email}`, verifyPassword("admin1234", user.password_hash));
}
const settingsRow = db.prepare("SELECT name, title FROM settings WHERE id = 1").get() as
  | { name: string; title: string }
  | undefined;
check("ajustes sembrados", settingsRow?.title === "Ingeniero Civil Metalúrgico");
const counts = db.prepare("SELECT (SELECT COUNT(*) FROM projects) p, (SELECT COUNT(*) FROM experience) e, (SELECT COUNT(*) FROM messages) m").get() as { p: number; e: number; m: number };
check(`proyectos sembrados (${counts.p})`, counts.p >= 6);
check(`experiencia sembrada (${counts.e})`, counts.e >= 4);
check(`mensajes de ejemplo (${counts.m})`, counts.m >= 2);

console.log(
  failures === 0
    ? "\nTODAS LAS PRUEBAS PASARON ✔"
    : `\n${failures} PRUEBA(S) FALLARON ✗`,
);
process.exit(failures === 0 ? 0 : 1);
