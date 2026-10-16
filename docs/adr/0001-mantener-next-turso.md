# ADR 0001 — Mantener Next.js + Turso/libSQL como stack del sitio

- **Fecha:** 2026-10-16
- **Estado:** Aceptado

## Contexto

El sitio es un portafolio personal con panel de administración propio, laboratorio
interactivo y despliegue serverless en Vercel. Se evaluó migrar a otro framework o a un
CMS gestionado para reducir código propio.

## Decisión

Mantener el stack actual: Next 16 (App Router) + React 19 + TypeScript, Drizzle ORM sobre
libSQL/Turso, Biome, Vitest y Playwright, con autenticación propia (JWT + scrypt) y
auditoría en la misma base.

## Consecuencias

- El costo operativo sigue siendo $0 (Vercel hobby + Turso free) y todo el contenido vive
  en una base SQLite replicada, sin dependencias de terceros.
- A cambio, la seguridad y el mantenimiento son responsabilidad propia: rate limiting,
  expiración de sesiones y CSP se implementan a mano (bloques 2 y 4 del endurecimiento).
- Una futura migración a nonce estricto de CSP o a otro proveedor de BD queda abierta;
  ambos cambios serían locales (next.config.ts / src/db).
