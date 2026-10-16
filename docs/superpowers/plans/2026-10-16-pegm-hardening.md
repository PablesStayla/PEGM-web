# Plan de implementación: Endurecimiento y pulido de PEGM-web (bloques 1–7)

> **Spec fuente:** `docs/superpowers/specs/2026-10-16-pegm-hardening-design.md` (aprobado, commit `1e355d3`)
> **Baseline:** `1e355d3` — árbol limpio; lint, type-check, vitest (23) y e2e (23) en verde.
> **Fecha:** 16 de octubre de 2026

## Goal

Ejecutar los bloques 1–7 del endurecimiento aprobado: bugs de contenido, seguridad
(rate limiting, epoch de sesión, CSP, scrypt async), SEO/IA (`llms.txt`), trazabilidad
(auditoría con eventos/IP hasheada/diff/paginación), rendimiento/logging, command
palette accesible e i18n por diccionarios; más ADR y nota superseded. Un commit por
bloque, en orden 1→7, con verificación verde al cierre de cada uno.

## Stack y convenciones de ejecución

- Next 16 (App Router) + React 19 + Turso/libSQL + Drizzle + Biome + Vitest + Playwright. **npm**.
- Verificación por bloque: `npm run lint`, `npm run type-check`, `npm test`; y `npm run test:e2e`
  cuando el bloque toque UI pública o flujos de navegador (bloques 1, 2, 4, 6, 7).
- **Nunca ejecutar `npx biome check --write .` sin alcance**: reformatea `.next` generado y
  produce TS2578. Usar `npm run lint:fix` (limitado a `src scripts tests`).
- Formato: Biome (comillas dobles, punto y coma, 100 columnas). Comentarios en español.
- La capa de datos es async: primero `const db = await getDb()`, luego consultas.
- Migración única `0002` generada en el bloque 2 con `npm run db:generate` y commiteada con él.
- E2E: 2 workers, puerto 3100, BD aislada recreada por corrida. Tras `page.goto`, usar `appReady`.

## Estructura de archivos

| Archivo | Acción | Bloque |
|---|---|---|
| `src/components/portfolio.tsx` | editar (1) y reescribir (7) | 1, 7 |
| `src/app/layout.tsx` | editar JSON-LD → grafo | 1 |
| `src/app/(site)/cv/page.tsx` | editar github | 1 |
| `src/app/sitemap.ts` | reescribir | 1 |
| `src/lib/data.ts` | editar (helper fechas, epoch, auditoría, cache, parallel, quiet) | 1, 2, 4, 5 |
| `src/db/schema.ts` | editar (rate_limits, sessionEpoch, audit cols) | 2 |
| `drizzle/0002_*.sql` | **nuevo** (generado) | 2 |
| `src/lib/rate-limit.ts` | **nuevo** | 2 |
| `src/lib/rate-limit.test.ts` | **nuevo** | 2 |
| `src/lib/auth.ts` | editar (epoch) | 2 |
| `src/lib/auth.test.ts` | editar | 2 |
| `src/lib/password.ts` | reescribir (async) | 2 |
| `src/lib/password.test.ts` | editar (await) | 2 |
| `src/lib/actions/auth.ts` | editar (rate limit, epoch, audit) | 2, 4 |
| `src/lib/actions/content.ts` | editar (async hash, epoch, audit compartida) | 2, 4 |
| `src/db/seed.ts` | editar (await hash) | 2 |
| `src/app/admin/(panel)/layout.tsx` | editar (epoch) | 2 |
| `next.config.ts` | editar (CSP) | 2 |
| `src/app/llms.txt/route.ts` | **nuevo** | 3 |
| `scripts/verify-deploy.mjs` | editar | 3 |
| `src/lib/audit.ts` | **nuevo** | 4 |
| `src/lib/actions/messages.ts` | editar (rate limit, audits) | 2, 4 |
| `src/app/admin/(panel)/auditoria/page.tsx` | reescribir (paginación+filtro) | 4 |
| `src/components/command-palette.tsx` | reescribir (`<dialog>`) | 6 |
| `src/app/globals.css` | editar (scroll-lock del dialog) | 6 |
| `tests/e2e/public.spec.ts` | editar (paleta ESC/foco) | 6 |
| `src/lib/i18n/es.ts` | **nuevo** (tipo + diccionario ES) | 7 |
| `src/lib/i18n/en.ts` | **nuevo** | 7 |
| `src/app/(site)/page.tsx` | editar (wrapper) | 7 |
| `src/app/(site)/en/page.tsx` | reescribir (wrapper delgado) | 7 |
| `src/components/site-header.tsx` | editar (diccionario) | 7 |
| `src/components/process-story.tsx` | editar (prop `story`) | 7 |
| `docs/adr/0001-mantener-next-turso.md` | **nuevo** | ADR |
| `docs/superpowers/specs/2026-08-14-pegm-metallurgical-platform-design.md` | editar (nota superseded) | ADR |

## Notas de desviación respecto al spec (verificadas contra el código el 2026-10-16)

1. El JSON-LD duplicado de `(site)/layout.tsx` **ya fue eliminado en el baseline `d616a03`**
   (solo queda un `ld+json` en `src/app/layout.tsx`). La tarea 1.2 se reduce a verificar la
   ausencia y completar el grafo Person + WebSite en el root layout.
2. `scripts/verify-deploy.mjs` **ya incluye `/en`** (línea 52). Solo se añaden `/llms.txt` y el
   check de CSP.
3. El spec listaba tablas sin `updatedAt` para el sitemap (`experience`, `education`, `skills`).
   Se usan las columnas reales: `settings.updatedAt` (home, `/en`, `/cv`) y `max(projects.updatedAt)`
   (`/proyectos`); `/laboratorio` omite `lastModified`.
4. `seed.ts:30` pasa `hashPassword(password)` dentro de un literal → requiere `await` al volverse
   asíncrona.
5. `adminDashboardStats` ya paraleliza 4 de 6 consultas (`Promise.all`, líneas 216-221); el bloque 5
   pliega `certifications` y `skills` en ese mismo `Promise.all`.
6. Los intentos de login que fallan la validación Zod **no** consumen rate limit, y el login exitoso
   **resetea** el contador. Esto protege la suite E2E (hace ~5 logins correctos + 1 fallido).
7. Los tokens JWT emitidos antes del bloque 2 (sin claim `epoch`) dejan de ser válidos:
   habrá que iniciar sesión una vez. Aceptado.
8. El command palette vive en `(site)/layout.tsx` (compartido por `/en`): sus ítems y el
   `aria-label` "Buscador del sitio" quedan en español también en `/en` (fuera de alcance de la spec).

---

## Bloque 1 — Corrección de bugs de contenido

### Tarea 1.1 — Portada: `title` y "Sobre mí" desde `settings` con fallback

**Archivo:** `src/components/portfolio.tsx`

**Paso 1.** Reemplazar la línea del rol del hero (línea 26):

```tsx
// Antes:
<p className="hero-role">Ingeniero Civil Metalúrgico · Universidad de Concepción</p>

// Después:
<p className="hero-role">
  {settings.title
    ? `${settings.title} · Universidad de Concepción`
    : "Ingeniero Civil Metalúrgico · Universidad de Concepción"}
</p>
```

**Paso 2.** Reemplazar el bloque de la sección "Sobre mí" (líneas 100-125: `<h2>` artístico,
tres párrafos fijos y el `Link` de cierre) por la versión que consume `settings` con fallback:

```tsx
{settings.aboutHeading ? (
  <h2>{settings.aboutHeading}</h2>
) : (
  <h2>
    La ingeniería empieza
    <br />
    con una buena
    <br />
    <em>pregunta.</em>
  </h2>
)}
<div>
  {settings.aboutParagraphs.length > 0 ? (
    settings.aboutParagraphs.map((paragraph, index) => (
      <p key={`${index}-${paragraph.slice(0, 24)}`} className={index === 0 ? "lead-copy" : undefined}>
        {paragraph}
      </p>
    ))
  ) : (
    <>
      <p className="lead-copy">
        ¿Qué ocurre dentro de un mineral, un flujo o un conjunto de datos? Mi trabajo
        empieza por entenderlo.
      </p>
      <p>
        Soy Ingeniero Civil Metalúrgico, titulado con Distinción Máxima y estudiante de
        Magíster en la Universidad de Concepción. Mi recorrido une investigación en
        CODELCO, modelamiento CFD y desarrollo de soluciones digitales.
      </p>
      <p>
        Busco aportar en ingeniería de procesos y proyectos, simulación y analítica
        aplicada a minería. Con rigor experimental, curiosidad y herramientas para
        convertir evidencia en criterio técnico.
      </p>
    </>
  )}
  <Link className="text-link" href="/cv">
    Conocer mi trayectoria completa <span aria-hidden="true">↗</span>
  </Link>
</div>
```

Nota: con la BD sembrada, el sitio mostrará `aboutHeading` y `aboutP1..P3` de `content.ts`
("Entre el experimento, el modelo y la decisión" + párrafos) — comportamiento buscado:
el panel dejó de editar campos invisibles. El fallback conserva los textos editoriales
actuales para el modo degradado. El `Link` a `/cv` queda **fuera** del condicional.

### Tarea 1.2 — JSON-LD: verificary completar el grafo Person + WebSite

**Archivo:** `src/app/layout.tsx`

**Paso 1.** Verificar ausencia de duplicados:

```bash
rg -n "ld\+json" src/   # debe listar solo src/app/layout.tsx
```

**Paso 2.** Reemplazar `personJsonLd` (líneas 45-72) por un grafo con `WebSite` + `Person`
y actualizar la llamada en `RootLayout` (`const jsonLd = await structuredData();`):

```tsx
/** Datos estructurados schema.org (Person + WebSite) para buscadores. */
async function structuredData() {
  const settings = await getSettings();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: settings.name,
        description: settings.tagline,
        inLanguage: "es-CL",
        publisher: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: settings.name,
        jobTitle: settings.title,
        description: settings.tagline,
        url: SITE_URL,
        email: `mailto:${settings.email}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: settings.location,
          addressCountry: "CL",
        },
        sameAs: [settings.linkedin, settings.github].filter(Boolean),
        image: `${SITE_URL}/pablo-garrido-sin-reflejo.png`,
        alumniOf: { "@type": "CollegeOrUniversity", name: "Universidad de Concepción" },
        knowsAbout: [
          "Ingeniería metalúrgica",
          "CFD",
          "Hidrometalurgia",
          "METSIM",
          "Analítica de datos",
        ],
      },
    ],
  };
}
```

El check de `verify-deploy.mjs` (`html.includes('"@type":"Person"')`) sigue pasando:
el grafo serializado contiene `"@type":"Person"`.

### Tarea 1.3 — CV: GitHub desde `settings.github`

**Archivo:** `src/app/(site)/cv/page.tsx`

**Paso 1.** Añadir el helper (tras los imports, antes de `Block`):

```tsx
/** "https://github.com/usuario" → "github.com/usuario" (para la línea de contacto). */
function githubLabel(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}
```

**Paso 2.** Reemplazar la línea 50:

```tsx
// Antes:
{settings.location} · {settings.email} · github.com/PablesStayla

// Después:
{[settings.location, settings.email, githubLabel(settings.github)].filter(Boolean).join(" · ")}
```

### Tarea 1.4 — Sitemap con fechas reales e idiomas

**Archivo 1:** `src/lib/data.ts` — añadir `max` al import de drizzle (línea 1) y la función
(sección de consultas públicas, tras `getLanguages`):

```ts
/** Última modificación real por zona del sitio (undefined si la BD no responde). */
export async function contentLastModified(): Promise<{
  home?: Date;
  cv?: Date;
  projects?: Date;
}> {
  try {
    const db = await getDb();
    const settingsRow = (
      await db
        .select({ updatedAt: t.settings.updatedAt })
        .from(t.settings)
        .where(eq(t.settings.id, 1))
        .limit(1)
        .all()
    )[0];
    const projectsMax = (
      await db.select({ value: max(t.projects.updatedAt) }).from(t.projects).all()
    )[0]?.value;
    if (!settingsRow && !projectsMax) return {};
    return {
      home: settingsRow?.updatedAt,
      cv: settingsRow?.updatedAt,
      projects: projectsMax ?? settingsRow?.updatedAt,
    };
  } catch {
    return {};
  }
}
```

**Archivo 2:** `src/app/sitemap.ts` — reescritura completa:

```ts
import type { MetadataRoute } from "next";
import { contentLastModified } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { home, cv, projects } = await contentLastModified();
  const languages = { "es-CL": SITE_URL, en: `${SITE_URL}/en` };

  return [
    { url: SITE_URL, lastModified: home, alternates: { languages } },
    { url: `${SITE_URL}/en`, lastModified: home, alternates: { languages } },
    { url: `${SITE_URL}/cv`, lastModified: cv },
    { url: `${SITE_URL}/proyectos`, lastModified: projects },
    { url: `${SITE_URL}/laboratorio` },
  ];
}
```

Se preserva el patrón de URLs (`${SITE_URL}${ruta}`) que `verify-deploy.mjs` valida:
home sin barra final. `lastModified` se omite cuando es `undefined` (BD caída).

### Tarea 1.5 — Verificación del bloque 1

```bash
npm run lint
npm run type-check
npm test
npm run test:e2e
```

Criterios:
- `public.spec.ts:9` (`/Ingeniero Civil Metalúrgico/`) sigue pasando: el rol renderizado es
  "Ingeniero Civil Metalúrgico · Universidad de Concepción" (título sembrado).
- `portfolio.spec.ts` (móvil, sin JS, EN) sin cambios: el ÉN solo depende de `process-story` y `lang`.
- `curl` del sitemap local: cada `<url>` con su `lastModified` real; home y `/en` con
  `xhtml:link hreflang`.

**Commit:** `fix: portada y CV reflejan los ajustes de la base de datos; sitemap con fechas reales`

---

## Bloque 2 — Seguridad

### Tarea 2.1 — Esquema y migración `0002`

**Archivo:** `src/db/schema.ts`

**Paso 1.** En `users`, tras `role`, añadir:

```ts
  /** Revocación de sesiones: se incrementa al cambiar la contraseña. */
  sessionEpoch: integer("session_epoch").notNull().default(0),
```

**Paso 2.** Nueva tabla (antes de `auditLog`):

```ts
/** Ventanas de rate limiting compartidas entre instancias serverless. */
export const rateLimits = sqliteTable(
  "rate_limits",
  {
    key: text("key").primaryKey(),
    windowStart: integer("window_start").notNull(),
    count: integer("count").notNull().default(0),
  },
  (table) => [index("rate_limits_window_idx").on(table.windowStart)],
);
```

**Paso 3.** `auditLog` con columnas nuevas e índices:

```ts
export const auditLog = sqliteTable(
  "audit_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userEmail: text("user_email").notNull(),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    detail: text("detail").notNull().default(""),
    /** Clave máquina estable del evento (auth.login_failure, content.update, …). */
    event: text("event").notNull().default(""),
    /** HMAC de la IP (nunca la IP en claro). */
    ipHash: text("ip_hash").notNull().default(""),
    userAgent: text("user_agent").notNull().default(""),
    /** JSON {before, after} acotado; nunca contraseñas ni tokens. */
    diff: text("diff").notNull().default(""),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("audit_created_idx").on(table.createdAt),
    index("audit_action_idx").on(table.action, table.createdAt),
  ],
);
```

**Paso 4.** Generar la migración y revisarla:

```bash
npm run db:generate
# → drizzle/0002_<nombre>.sql + snapshot. Verificar:
#   - CREATE TABLE rate_limits + índice
#   - ALTER users ADD session_epoch integer NOT NULL DEFAULT 0
#   - ALTER audit_log ADD event/ip_hash/user_agent/diff text NOT NULL DEFAULT ''
#   - índices audit_created_idx y audit_action_idx
```

### Tarea 2.2 — `src/lib/rate-limit.ts` (TDD)

**Paso 1 (test primero):** crear `src/lib/rate-limit.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { clientIp, rateLimitKey } from "./rate-limit";

describe("rate limit: helpers puros", () => {
  it("clientIp toma la primera IP de x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientIp(headers)).toBe("1.2.3.4");
  });

  it("clientIp usa x-real-ip como respaldo", () => {
    const headers = new Headers({ "x-real-ip": "9.9.9.9" });
    expect(clientIp(headers)).toBe("9.9.9.9");
  });

  it("clientIp devuelve 'desconocida' sin cabeceras", () => {
    expect(clientIp(new Headers())).toBe("desconocida");
  });

  it("rateLimitKey es determinista, hexadecimal y separa ámbitos", () => {
    const a = rateLimitKey("login", "1.2.3.4:a@b.cl");
    expect(a).toMatch(/^[a-f0-9]{64}$/);
    expect(rateLimitKey("login", "1.2.3.4:a@b.cl")).toBe(a);
    expect(rateLimitKey("contact", "1.2.3.4:a@b.cl")).not.toBe(a);
  });
});
```

**Paso 2 (implementación):** `src/lib/rate-limit.ts`:

```ts
import { createHmac } from "node:crypto";
import { eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { rateLimits } from "@/db/schema";

/**
 * Rate limiting con ventanas fijas en la base de datos (compartido entre
 * instancias serverless). Las claves son HMAC-SHA256: nunca se guardan IPs
 * ni correos en claro.
 */

export function rateLimitKey(scope: string, value: string): string {
  const secret = process.env.AUTH_SECRET ?? "secreto-de-desarrollo-cambiar-en-produccion";
  return createHmac("sha256", secret).update(`${scope}:${value}`).digest("hex");
}

/** IP del cliente a partir de las cabeceras del proxy (Vercel). */
export function clientIp(header: { get(name: string): string | null }): string {
  const forwarded = header.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "desconocida";
  return header.get("x-real-ip")?.trim() || "desconocida";
}

/**
 * Consume un intento. Devuelve true si está permitido.
 * Upsert atómico con `RETURNING`: la ventana se resetea sola al cambiar.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const db = await getDb();
  const now = Date.now();
  const windowStart = now - (now % windowMs);

  const rows = await db
    .insert(rateLimits)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        windowStart: sql`excluded.window_start`,
        count: sql`case when ${rateLimits.windowStart} = excluded.window_start then ${rateLimits.count} + 1 else 1 end`,
      },
    })
    .returning({ count: rateLimits.count })
    .all();

  const count = rows[0]?.count ?? 1;

  // Purga perezosa: al abrir ventana nueva, limpia las vencidas (índice por window_start).
  if (count === 1) {
    await db.delete(rateLimits).where(lt(rateLimits.windowStart, windowStart - windowMs)).run();
  }

  return count <= limit;
}

/** Limpia el contador (p. ej. tras un login exitoso). */
export async function resetRateLimit(key: string): Promise<void> {
  const db = await getDb();
  await db.delete(rateLimits).where(eq(rateLimits.key, key)).run();
}
```

### Tarea 2.3 — `src/lib/auth.ts`: claim `epoch`

**Archivo:** `src/lib/auth.ts`

```ts
export type SessionPayload = {
  email: string;
  name: string;
  /** Contador de revocación: debe coincidir con users.session_epoch. */
  epoch: number;
};
```

En `createSessionToken`: `new SignJWT({ email: payload.email, name: payload.name, epoch: payload.epoch })`.
En `verifySessionToken`, exigir `typeof payload.epoch === "number"` (si falta → `null`; los tokens
antiguos quedan inválidos a propósito) y devolver `{ email, name, epoch }`.

**Archivo:** `src/lib/auth.test.ts` — actualizar:

- El payload de prueba ahora incluye `epoch: 3` y la expectativa `toEqual({ email: "admin@pablo.cl", name: "Pablo", epoch: 3 })`.
- Nuevo test (importar `SignJWT` de `jose`):

```ts
it("rechaza tokens sin claim epoch (formato antiguo)", async () => {
  const legacy = await new SignJWT({ email: "a@b.cl", name: "A" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode("secreto-de-desarrollo-cambiar-en-produccion"));
  expect(await verifySessionToken(legacy)).toBeNull();
});
```

### Tarea 2.4 — `src/lib/password.ts` asíncrono

**Archivo:** `src/lib/password.ts` — reescritura completa:

```ts
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
```

**Archivo:** `src/lib/password.test.ts` — envolver todas las llamadas en `await` y renombrar el
`describe` a "hash de contraseñas (scrypt asíncrono)". Las aserciones son las mismas.

**Callers que requieren `await`:**

- `src/db/seed.ts:30` → `passwordHash: await hashPassword(password)`.
- `src/lib/actions/content.ts` (`changePassword`) → ver tarea 2.6.
- `src/lib/actions/auth.ts` (`login`) → ver tarea 2.5.

### Tarea 2.5 — Login: rate limit + epoch

**Archivo:** `src/lib/actions/auth.ts` — nueva versión de `login` (el `logout` no cambia en este bloque):

```ts
"use server";

import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { clientIp, consumeRateLimit, rateLimitKey, resetRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const from = String(formData.get("from") ?? "/admin") || "/admin";

  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { email, password } = parsed.data;

  // 5 intentos / 15 min por (IP + correo). Los fallos de Zod no cuentan.
  const headerList = await headers();
  const key = rateLimitKey("login", `${clientIp(headerList)}:${email.toLowerCase()}`);
  try {
    if (!(await consumeRateLimit(key, 5, 15 * 60 * 1000))) {
      return { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
    }
  } catch {
    // Sin rate limit disponible (BD caída): el login fallará abajo con su propio error.
  }

  let userRow: { name: string; passwordHash: string; sessionEpoch: number } | undefined;

  try {
    const db = await getDb();
    const user = (await db.select().from(users).where(eq(users.email, email)).limit(1).all())[0];
    if (user && (await verifyPassword(password, user.passwordHash))) {
      userRow = user;
    }
  } catch {
    return { error: "La base de datos no está disponible." };
  }

  if (!userRow) {
    return { error: "Credenciales inválidas." };
  }

  // Login exitoso: limpia el contador de intentos fallidos.
  try {
    await resetRateLimit(key);
  } catch {
    // el reset es best-effort
  }

  const token = await createSessionToken({
    email,
    name: userRow.name,
    epoch: userRow.sessionEpoch,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions);

  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
```

### Tarea 2.6 — `changePassword`: incremento de epoch y re-emisión de cookie

**Archivo:** `src/lib/actions/content.ts`

**Paso 1.** Ampliar imports de auth: `import { SESSION_COOKIE, sessionCookieOptions, createSessionToken, verifySessionToken } from "@/lib/auth";`

**Paso 2.** En `changePassword`, reemplazar el tramo desde la verificación de contraseña hasta el
`redirect` final:

```ts
  if (!row || !(await verifyPassword(current, row.passwordHash))) {
    redirect("/admin/ajustes?error=password-wrong");
  }

  // Incrementa el epoch: revoca todas las sesiones emitidas con el anterior.
  const nextEpoch = row.sessionEpoch + 1;

  await db
    .update(t.users)
    .set({ passwordHash: await hashPassword(next), sessionEpoch: nextEpoch })
    .where(eq(t.users.id, row.id))
    .run();
  await audit(user.email, "actualizó", "contraseña");

  // Re-emite la cookie de ESTA sesión con el nuevo epoch (las demás quedan revocadas).
  const store = await cookies();
  store.set(
    SESSION_COOKIE,
    await createSessionToken({ email: user.email, name: user.name, epoch: nextEpoch }),
    sessionCookieOptions,
  );

  redirect("/admin/ajustes?saved=password");
```

### Tarea 2.7 — `(panel)/layout.tsx`: verificación de epoch

**Archivos:** `src/lib/data.ts` y `src/app/admin/(panel)/layout.tsx`

**Paso 1.** En data.ts (sección admin):

```ts
export async function adminSessionEpoch(email: string): Promise<number | null> {
  const db = await getDb();
  const row = (
    await db
      .select({ epoch: t.users.sessionEpoch })
      .from(t.users)
      .where(eq(t.users.email, email))
      .limit(1)
      .all()
  )[0];
  return row ? row.epoch : null;
}
```

**Paso 2.** En el layout, tras el chequeo de `session`:

```ts
  // Revocación: el epoch del token debe coincidir con el de la cuenta.
  const epoch = await adminSessionEpoch(session.email);
  if (epoch === null || epoch !== session.epoch) {
    redirect("/admin/login");
  }
```

(La página de login no redirige a usuarios autenticados → no hay bucle.)

### Tarea 2.8 — Rate limit del formulario de contacto

**Archivo:** `src/lib/actions/messages.ts`

**Paso 1.** Imports: `import { cookies, headers } from "next/headers";` y
`import { clientIp, consumeRateLimit, rateLimitKey } from "@/lib/rate-limit";`

**Paso 2.** En `sendMessage`, tras el parseo Zod exitoso (`const { name, email, body } = parsed.data;`):

```ts
  // 5 envíos / hora por IP (después del honeypot: los bots no consumen).
  const headerList = await headers();
  const allowed = await consumeRateLimit(
    rateLimitKey("contact", clientIp(headerList)),
    5,
    60 * 60 * 1000,
  );
  if (!allowed) {
    return { error: "Demasiados mensajes enviados. Intenta más tarde." };
  }
```

### Tarea 2.9 — CSP en `next.config.ts`

**Archivo:** `next.config.ts` — añadir a `securityHeaders` (después de `Permissions-Policy`):

```ts
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
  },
```

(El JSON-LD `type="application/ld+json"` no es ejecutable y `'unsafe-inline'` en `script-src`
cubre los scripts inline de Next en producción. El nonce estricto queda como mejora futura.)

### Tarea 2.10 — Verificación del bloque 2

```bash
npm run lint
npm run type-check
npm test          # password async, epoch, rate-limit helpers
npm run build     # valida CSP y compilación de producción
npm run test:e2e  # auth.spec y panel.spec: login sigue verde
```

Manual (dev): tras cambiar la contraseña en `/admin/ajustes`, la sesión actual sigue activa;
borrar la cookie y volver a entrar con la contraseña nueva funciona; los 5 fallos de login
muestran "Demasiados intentos…".

**Commit:** `feat: rate limiting en Turso, epoch de sesión, scrypt asíncrono y CSP`

---

## Bloque 3 — SEO/IA

### Tarea 3.1 — `llms.txt` estático

**Archivo nuevo:** `src/app/llms.txt/route.ts`

```ts
import { site } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Resumen del sitio para asistentes de IA (llms.txt).
 * Estático a propósito: sin BD ni datos por request.
 */
export function GET() {
  const body = [
    `# ${site.name} — ${site.title}`,
    "",
    `> ${site.tagline}`,
    "",
    "## Páginas",
    "",
    `- [Portada (es)](${SITE_URL}/): identidad, enfoque, proyectos destacados, laboratorio y contacto.`,
    `- [Home (en)](${SITE_URL}/en): versión en inglés de la portada.`,
    `- [CV](${SITE_URL}/cv): experiencia, educación, certificaciones, software y áreas técnicas.`,
    `- [Proyectos](${SITE_URL}/proyectos): portafolio completo de proyectos de ingeniería.`,
    `- [Laboratorio](${SITE_URL}/laboratorio): simuladores didácticos (flotación, balance de masa, Eh-pH, planta en vivo).`,
    "",
    "## Contacto",
    "",
    `- Correo: ${site.email}`,
    `- GitHub: ${site.github}`,
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

### Tarea 3.2 — `verify-deploy.mjs`

**Archivo:** `scripts/verify-deploy.mjs`

**Paso 1.** Línea 52: añadir `/llms.txt` a la lista de rutas:

```js
for (const ruta of ["/en", "/cv", "/proyectos", "/laboratorio", "/cv-pablo-garrido.pdf", "/llms.txt"]) {
```

**Paso 2.** Check de headers (línea ~94): exigir también la CSP:

```js
  const faltan = [
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
    "content-security-policy",
  ].filter((h) => !r.headers.get(h));
```

### Tarea 3.3 — Verificación del bloque 3

```bash
npm run lint
npm run type-check
npm test
npm run build   # el route estático se prerenderiza
curl -s http://localhost:3000/llms.txt   # en dev no existe (force-static en build), probar con el build local
```

**Commit:** `feat: llms.txt y verificación de deploy ampliada`

---

## Bloque 4 — Trazabilidad (auditoría)

### Tarea 4.1 — Helper compartido `src/lib/audit.ts`

**Archivo nuevo:**

```ts
import { lt } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "@/db";
import { auditLog } from "@/db/schema";
import { clientIp, rateLimitKey } from "@/lib/rate-limit";

const RETENTION_MS = 365 * 24 * 60 * 60 * 1000;
const DIFF_LIMIT = 4000;

export type AuditEntry = {
  userEmail: string;
  /** Texto humano visible en el panel ("actualizó", "inició sesión", …). */
  action: string;
  entity: string;
  detail?: string;
  /** Clave máquina estable para filtrar ("content.update", "auth.login_failure", …). */
  event: string;
  /** Estado anterior/posterior para el diff (nunca contraseñas ni tokens). */
  before?: unknown;
  after?: unknown;
};

/** Registra una entrada de auditoría con IP hasheada y user-agent. */
export async function audit(entry: AuditEntry): Promise<void> {
  const headerList = await headers();
  const db = await getDb();
  const hasDiff = entry.before !== undefined || entry.after !== undefined;
  await db
    .insert(auditLog)
    .values({
      userEmail: entry.userEmail,
      action: entry.action,
      entity: entry.entity,
      detail: entry.detail ?? "",
      event: entry.event,
      ipHash: rateLimitKey("audit-ip", clientIp(headerList)),
      userAgent: (headerList.get("user-agent") ?? "").slice(0, 300),
      diff: hasDiff
        ? JSON.stringify({ before: entry.before ?? null, after: entry.after ?? null }).slice(
            0,
            DIFF_LIMIT,
          )
        : "",
    })
    .run();
}

/** Retención de 365 días (purga perezosa; se invoca en el login y al leer auditoría). */
export async function purgeOldAuditLog(): Promise<void> {
  const db = await getDb();
  await db
    .delete(auditLog)
    .where(lt(auditLog.createdAt, new Date(Date.now() - RETENTION_MS)))
    .run();
}
```

### Tarea 4.2 — `actions/content.ts`: auditoría compartida, eventos y diffs

**Archivo:** `src/lib/actions/content.ts`

**Paso 1.** Eliminar el helper local `audit` (líneas 25-28). Imports nuevos:

```ts
import { adminGetSettings } from "@/lib/data";
import { audit } from "@/lib/audit";
```

**Paso 2.** `saveSettings` (reemplaza el tramo desde `const db = await getDb();`):

```ts
  const db = await getDb();
  const before = await adminGetSettings();
  await db.update(t.settings).set(values).where(eq(t.settings.id, 1)).run();
  await audit({
    userEmail: user.email,
    action: "actualizó",
    entity: "ajustes del sitio",
    event: "content.save_settings",
    before,
    after: values,
  });
```

**Paso 3.** `changePassword`: el `await audit(user.email, "actualizó", "contraseña");` pasa a
(después del update, junto al epoch — tarea 2.6):

```ts
  await audit({
    userEmail: user.email,
    action: "actualizó",
    entity: "contraseña",
    event: "auth.change_password",
  });
```

**Paso 4.** `saveProject` y `deleteProject` (patrón para el resto):

```ts
  const db = await getDb();
  if (id) {
    const before = (
      await db.select().from(t.projects).where(eq(t.projects.id, id)).limit(1).all()
    )[0];
    await db.update(t.projects).set(values).where(eq(t.projects.id, id)).run();
    await audit({
      userEmail: user.email,
      action: "actualizó",
      entity: "proyecto",
      detail: values.title,
      event: "content.update_project",
      before,
      after: values,
    });
  } else {
    await db.insert(t.projects).values(values).run();
    await audit({
      userEmail: user.email,
      action: "creó",
      entity: "proyecto",
      detail: values.title,
      event: "content.create_project",
      after: values,
    });
  }
```

```ts
export async function deleteProject(formData: FormData) {
  const user = await requireUser();
  const id = idOrThrow(formData, "/admin/proyectos");
  const db = await getDb();
  const before = (
    await db.select().from(t.projects).where(eq(t.projects.id, id)).limit(1).all()
  )[0];
  await db.delete(t.projects).where(eq(t.projects.id, id)).run();
  await audit({
    userEmail: user.email,
    action: "eliminó",
    entity: "proyecto",
    detail: `#${id}`,
    event: "content.delete_project",
    before,
  });
  refreshPublicPages();
  revalidatePath("/admin/proyectos");
  redirect("/admin/proyectos?deleted=1");
}
```

**Paso 5.** Aplicar el mismo patrón (fetch `before` cuando `id`/borrado, `after: values` cuando
aplica) a las funciones restantes, con estos eventos:

| Función | update | create | delete |
|---|---|---|---|
| `saveExperience` / `deleteExperience` | `content.update_experience` | `content.create_experience` | `content.delete_experience` |
| `saveEducation` / `deleteEducation` | `content.update_education` | `content.create_education` | `content.delete_education` |
| `saveCertification` / `deleteCertification` | `content.update_certification` | `content.create_certification` | `content.delete_certification` |
| `saveLanguage` / `deleteLanguage` | `content.update_language` | `content.create_language` | `content.delete_language` |
| `saveSkill` / `deleteSkill` | `content.update_skill` | `content.create_skill` | `content.delete_skill` |

Los textos de `action`/`entity`/`detail` visibles **no cambian** (los e2e del panel los verifican).

**Paso 6.** `seed.ts`: al registro de auditoría del sembrado añadir `event: "system.seed"`
(la columna existe desde el bloque 2).

### Tarea 4.3 — `actions/messages.ts`: rate limit del contacto ya aplicado + auditoría

**Archivo:** `src/lib/actions/messages.ts`

**Paso 1.** Imports: quitar `auditLog` de `@/db/schema` (queda `messages`) y añadir
`import { audit } from "@/lib/audit";`

**Paso 2.** `toggleMessageRead`: capturar el usuario y auditar el cambio real:

```ts
export async function toggleMessageRead(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  if (!id) redirect("/admin/mensajes");

  const db = await getDb();
  const row = (await db.select().from(messages).where(eq(messages.id, id)).limit(1).all())[0];
  if (row) {
    await db
      .update(messages)
      .set({ read: not(messages.read) })
      .where(eq(messages.id, id))
      .run();
    await audit({
      userEmail: user.email,
      action: row.read ? "marcó como no leído" : "marcó como leído",
      entity: "mensaje",
      detail: `#${id}`,
      event: "message.toggle_read",
      before: { read: row.read },
      after: { read: !row.read },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/mensajes");
  redirect("/admin/mensajes");
}
```

**Paso 3.** `deleteMessage`: reemplazar el `insert(auditLog)` inline por:

```ts
    await audit({
      userEmail: user.email,
      action: "eliminó",
      entity: "mensaje",
      detail: `#${id}`,
      event: "message.delete",
    });
```

(Sin `before`: no se registra el contenido de los mensajes.)

### Tarea 4.4 — Eventos de autenticación

**Archivo:** `src/lib/actions/auth.ts`

**Paso 1.** Imports: añadir `verifySessionToken` a los imports de `@/lib/auth` y
`import { audit, purgeOldAuditLog } from "@/lib/audit";`

**Paso 2.** Credenciales inválidas (antes del `return { error: "Credenciales inválidas." }`):

```ts
  if (!userRow) {
    try {
      await audit({
        userEmail: email,
        action: "intentó iniciar sesión",
        entity: "sesión",
        detail: "credenciales inválidas",
        event: "auth.login_failure",
      });
    } catch {
      // la auditoría no debe bloquear la respuesta
    }
    return { error: "Credenciales inválidas." };
  }
```

**Paso 3.** Login exitoso (tras `resetRateLimit` y antes de emitir el token):

```ts
  try {
    await audit({
      userEmail: email,
      action: "inició sesión",
      entity: "sesión",
      event: "auth.login_success",
    });
    await purgeOldAuditLog();
  } catch {
    // la auditoría no debe bloquear el acceso
  }
```

**Paso 4.** `logout`:

```ts
export async function logout() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (session) {
    try {
      await audit({
        userEmail: session.email,
        action: "cerró sesión",
        entity: "sesión",
        event: "auth.logout",
      });
    } catch {
      // la auditoría no debe bloquear la salida
    }
  }
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
```

### Tarea 4.5 — `data.ts`: paginación y filtro

**Archivo:** `src/lib/data.ts` — reemplazar `adminAuditLog`:

```ts
export async function adminAuditLog({
  page = 1,
  action = "",
}: { page?: number; action?: string } = {}) {
  const db = await getDb();
  const perPage = 25;
  const where = action ? eq(t.auditLog.action, action) : undefined;

  const total =
    (await db.select({ value: count() }).from(t.auditLog).where(where).all())[0]?.value ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pageCount);

  const rows = await db
    .select()
    .from(t.auditLog)
    .where(where)
    .orderBy(desc(t.auditLog.createdAt))
    .limit(perPage)
    .offset((current - 1) * perPage)
    .all();

  return { rows, total, page: current, pageCount };
}

export async function adminDistinctAuditActions(): Promise<string[]> {
  const db = await getDb();
  const rows = await db
    .selectDistinct({ action: t.auditLog.action })
    .from(t.auditLog)
    .orderBy(asc(t.auditLog.action))
    .all();
  return rows.map((row) => row.action);
}
```

### Tarea 4.6 — Página de auditoría con filtro y paginación

**Archivo:** `src/app/admin/(panel)/auditoria/page.tsx` — reescritura completa:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { adminAuditLog, adminDistinctAuditActions } from "@/lib/data";

export const metadata: Metadata = {
  title: "Auditoría",
  robots: { index: false },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>;
}) {
  const params = await searchParams;
  const action = typeof params.action === "string" ? params.action : "";
  const requestedPage = Number(params.page ?? "1") || 1;

  const [{ rows, total, page, pageCount }, actions] = await Promise.all([
    adminAuditLog({ page: requestedPage, action }),
    adminDistinctAuditActions(),
  ]);

  function buildHref(next: { page?: number; action?: string }) {
    const query = new URLSearchParams();
    const nextAction = next.action ?? action;
    const nextPage = next.page ?? 1;
    if (nextAction) query.set("action", nextAction);
    if (nextPage > 1) query.set("page", String(nextPage));
    const suffix = query.toString();
    return suffix ? `/admin/auditoria?${suffix}` : "/admin/auditoria";
  }

  const chip = (active: boolean) =>
    `border px-3 py-1 text-xs ${
      active ? "border-accent text-accent" : "border-line text-muted hover:text-accent"
    }`;

  return (
    <>
      <PageHeader
        title="Auditoría"
        description={`Registro de todas las acciones realizadas en el panel (${total} entradas).`}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href={buildHref({ action: "" })} className={chip(action === "")}>
          Todas
        </Link>
        {actions.map((item) => (
          <Link key={item} href={buildHref({ action: item })} className={chip(item === action)}>
            {item}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto border border-line bg-bg">
        {rows.length === 0 ? (
          <p className="p-5 text-sm text-muted">Sin registros.</p>
        ) : (
          <table className="w-full min-w-160 text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wider text-muted uppercase">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Acción</th>
                <th className="px-4 py-3 font-medium">Entidad</th>
                <th className="px-4 py-3 font-medium">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {formatDate(entry.createdAt)}
                  </td>
                  <td className="px-4 py-3">{entry.userEmail}</td>
                  <td className="px-4 py-3">{entry.action}</td>
                  <td className="px-4 py-3 text-accent">{entry.entity}</td>
                  <td className="px-4 py-3 text-muted" title={entry.event}>
                    {entry.detail || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pageCount > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <Link
            href={buildHref({ page: page - 1 })}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-40" : "hover:text-accent"}
          >
            ← Anterior
          </Link>
          <span>
            Página {page} de {pageCount}
          </span>
          <Link
            href={buildHref({ page: page + 1 })}
            aria-disabled={page >= pageCount}
            className={page >= pageCount ? "pointer-events-none opacity-40" : "hover:text-accent"}
          >
            Siguiente →
          </Link>
        </div>
      ) : null}
    </>
  );
}
```

### Tarea 4.7 — Verificación del bloque 4

```bash
npm run lint
npm run type-check
npm test
npm run test:e2e   # panel.spec (auditoría: "creó"/"eliminó"), auth.spec, contacto.spec
```

Manual: iniciar sesión → `/admin/auditoria` muestra chips de filtro, paginación (si hay > 25) y
`título` del detalle con el `event`; un login fallido agrega "intentó iniciar sesión".

**Commit:** `feat: auditoría con eventos, IP hasheada, diff y paginación`

---

## Bloque 5 — Rendimiento y logging

### Tarea 5.1 — Helper `src/lib/log.ts`

**Archivo nuevo:**

```ts
/**
 * Logging silencioso. En producción no escribe nada: los catch de
 * degradación elegante no deben inundar los logs de Vercel.
 */
export function quiet(error: unknown, context: string): void {
  if (process.env.NODE_ENV !== "development") return;
  console.warn(`[pegm] ${context}:`, error);
}
```

### Tarea 5.2 — `data.ts`: cache por request + degradación con log

**Archivo:** `src/lib/data.ts`

**Paso 1.** Imports nuevos: `import { cache } from "react";` y
`import { quiet } from "@/lib/log";`

**Paso 2.** Envolver cada getter público con `cache(...)` (dedupe por request: hoy
`getSettings`/`getProjects` se repiten entre `generateMetadata`, layout y página) y
reemplazar los `catch` vacíos por `catch (error) { quiet(error, "<getter>"); }`.
Patrón exacto (ejemplo con `getSettings`; el cuerpo interno no cambia):

```ts
export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const db = await getDb();
    // …consulta actual sin cambios…
    return { /* …mapeo actual… */ };
  } catch (error) {
    quiet(error, "getSettings");
    return fallbackSettings();
  }
});
```

Aplicar a: `getProjects`, `getExperience`, `getEducation`, `getCertifications`, `getSkills`,
`getLanguages` y `contentLastModified` (bloque 1) — el contexto del `quiet` es el nombre de
la función. **No** envolver las consultas `admin*` (panel: sin repetición por request y la
caché por request no aporta).

### Tarea 5.3 — `adminDashboardStats`: 6 consultas en un solo `Promise.all`

**Archivo:** `src/lib/data.ts` — reemplazar la función:

```ts
export async function adminDashboardStats() {
  const db = await getDb();
  const [projects, experienceRows, total, read, certifications, skills] = await Promise.all([
    db.select({ value: count() }).from(t.projects).all(),
    db.select({ value: count() }).from(t.experience).all(),
    db.select({ value: count() }).from(t.messages).all(),
    db.select({ value: count() }).from(t.messages).where(eq(t.messages.read, true)).all(),
    db.select({ value: count() }).from(t.certifications).all(),
    db.select({ value: count() }).from(t.skills).all(),
  ]);
  return {
    projects: projects[0]?.value ?? 0,
    experience: experienceRows[0]?.value ?? 0,
    messages: total[0]?.value ?? 0,
    unreadMessages: (total[0]?.value ?? 0) - (read[0]?.value ?? 0),
    certifications: certifications[0]?.value ?? 0,
    skills: skills[0]?.value ?? 0,
  };
}
```

### Tarea 5.4 — Verificación del bloque 5

```bash
npm run lint
npm run type-check
npm test
npm run test:e2e   # la caché por request toca todas las páginas públicas
```

**Commit:** `perf: cache por request, degradación silenciosa y consultas paralelas`

---

## Bloque 6 — Command palette accesible con `<dialog>`

### Tarea 6.1 — Reescribir `src/components/command-palette.tsx`

**Archivo:** `src/components/command-palette.tsx` — reescritura completa (conserva
`PaletteItem`, `OPEN_EVENT`, `openCommandPalette` y los textos):

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, icons } from "@/components/icons";

export type PaletteItem = {
  group: string;
  label: string;
  href: string;
};

const OPEN_EVENT = "pk:palette:open";

/** Permite abrir la paleta desde cualquier botón (ej: el header). */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function CommandPalette({ items }: { items: PaletteItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Estado React → API nativa del dialog (showModal da foco atrapado, ESC y backdrop).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  let lastGroup = "";

  return (
    <dialog
      ref={dialogRef}
      data-palette
      aria-label="Buscador del sitio"
      onClose={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      onClick={(event) => {
        // Clic en el fondo (fuera del contenido) cierra la paleta.
        if (event.target === dialogRef.current) setOpen(false);
      }}
      className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-start justify-center px-4 pt-[12vh]">
        <div
          className="w-full max-w-lg border border-line bg-bg shadow-xl"
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((i) => Math.min(i + 1, results.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            }
            if (event.key === "Enter" && results[active]) {
              event.preventDefault();
              go(results[active].href);
            }
          }}
        >
          <div className="flex items-center gap-3 border-b border-line px-4">
            <Icon path={icons.search} className="size-4 shrink-0 text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar en el sitio…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
            <kbd className="hidden border border-line px-1.5 py-0.5 text-[10px] text-muted sm:block">
              ESC
            </kbd>
          </div>

          <ul className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted">
                Sin resultados para “{query}”.
              </li>
            ) : (
              results.map((item, index) => {
                const showGroup = item.group !== lastGroup;
                lastGroup = item.group;
                return (
                  <li key={`${item.href}-${item.label}`}>
                    {showGroup ? (
                      <p className="px-3 pt-3 pb-1 text-[10px] font-medium tracking-[0.18em] text-muted uppercase">
                        {item.group}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(item.href)}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                        index === active ? "bg-surface text-ink" : "text-muted"
                      }`}
                    >
                      <span>{item.label}</span>
                      {index === active ? (
                        <Icon path={icons.arrowRight} className="size-3.5 text-accent" />
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </dialog>
  );
}
```

Notas:
- Si Biome marca `onClick` en el `<dialog>` (`lint/a11y/useKeyWithClickEvents`), añadir encima
  `// biome-ignore lint/a11y/useKeyWithClickEvents: el cierre por teclado lo da el dialog nativo (ESC).`
- El foco al abrir y el atrapado de foco los da `showModal()`; no hace falta FocusTrap manual.

### Tarea 6.2 — Scroll-lock del dialog

**Archivo:** `src/app/globals.css` — añadir al final:

```css
/* Evita el scroll de fondo mientras el command palette está abierto. */
body:has(dialog[data-palette][open]) {
  overflow: hidden;
}
```

(El `<dialog>` modal no bloquea el scroll del body por sí solo en todos los navegadores.)

### Tarea 6.3 — E2E de teclado y foco

**Archivo:** `tests/e2e/portfolio.spec.ts` — añadir un test (viewport de escritorio, el default):

```ts
test("el buscador se cierra con Escape y con clic fuera, y enfoca el campo", async ({ page }) => {
  await page.goto("/");
  await appReady(page);

  await page.getByRole("button", { name: /Buscar en el sitio/ }).click();
  const dialog = page.getByRole("dialog", { name: "Buscador del sitio" });
  await expect(dialog).toBeVisible();
  await expect(page.getByPlaceholder("Buscar en el sitio…")).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();

  await page.getByRole("button", { name: /Buscar en el sitio/ }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(dialog).not.toBeVisible();
});
```

(El cierre por clic-fuera se cubre de forma implícita: el backdrop ahora es el propio
`<dialog>`; si el test anterior pasa y el dialog vuelve a abrirse, la ruta nativa está sana.
No añadir clics en coordenadas absolutas: son frágiles.)

### Tarea 6.4 — Verificación del bloque 6

```bash
npm run lint
npm run type-check
npm test
npm run test:e2e   # public.spec (paleta existente) + portfolio.spec (nuevo test)
```

Manual: abrir la paleta con Ctrl+K y con el botón del header; verificar ESC, clic fuera,
flechas + Enter, y que el fondo no hace scroll.

**Commit:** `feat: command palette con <dialog> nativo (foco, ESC y scroll-lock)`

---

## Bloque 7 — i18n por diccionarios

> Refactor de mayor superficie del plan. Regla de oro: **ningún texto cambia** en `es`;
> en `en` se traslada el contenido actual de `en/page.tsx` y `englishChapters`. Los e2e
> dependen de los literales ES actuales y de los ids `#simulacion`, `#proyectos`, etc.

### Tarea 7.1 — Tipo `Dictionary` y diccionario ES

**Archivo nuevo:** `src/lib/i18n/es.ts`

```ts
/** Titular editorial: líneas con salto duro + línea final en cursiva (clase `em`). */
export type Headline = {
  lines: string[];
  accent: string;
};

export type StoryChapter = {
  id: string;
  label: string;
  title: string;
  text: string;
  tools: string;
  metric: string;
  unit: string;
  caption: string;
  symbol: string;
  detail: string;
};

export type StoryDict = {
  eyebrow: string;
  heading: Headline;
  instrumentLabel: string;
  svgTitle: string;
  ariaSection: string;
  ariaNav: string;
  chapters: StoryChapter[];
};

export type FeaturedProject = {
  id: string;
  meta: string;
  title: string;
  summary: string;
  tags: string[];
};

export type AboutSection = {
  eyebrow: string;
  /** Texto plano (ajustes de la BD) o titular artístico. */
  heading: string | Headline;
  /** Párrafos; el primero se muestra como lead. */
  paragraphs: string[];
};

export type Dictionary = {
  nav: {
    home: string;
    projects: string;
    laboratory: string;
    cv: string;
    contact: string;
    search: string;
  };
  hero: {
    availability: string;
    role: string;
    manifesto: Headline;
    description: string;
    primaryCta: string;
    downloadCta: string;
    location: string;
    scrollHint: string;
    tag: string;
    portraitAlt: string;
    portraitCaption: [string, string];
    portraitNoteEyebrow: string;
    portraitNote: Headline;
  };
  about: {
    eyebrow: string;
    /** Titular del fallback (BD sin ajustes). */
    heading: Headline;
    /** Párrafos del fallback (BD sin ajustes). */
    paragraphs: string[];
  };
  stats: { value: string; label: string }[];
  story: StoryDict;
  projects: {
    eyebrow: string;
    heading: Headline;
    ctaAll: string;
    footnote: string;
    /** Pie de la ilustración por índice (el último se repite si faltan). */
    artFootnotes: string[];
    /** Solo EN: destacados estáticos (en ES vienen de la BD). */
    items?: FeaturedProject[];
  };
  career: {
    /** EN no muestra la sección de trayectoria. */
    show: boolean;
    eyebrow: string;
    heading: Headline;
    intro: string;
    cta: string;
  };
  lab: {
    eyebrow: string;
    /** Lleva el punto cobre final (`<span className="copper-dot">.`). */
    heading: string;
    intro: string;
    mode: "links" | "cta";
    links?: { n: string; title: string; detail: string; href: string; formula: string }[];
    ctaLabel?: string;
    ctaHref?: string;
    footnote: string;
  };
  contact: {
    eyebrow: string;
    heading: Headline;
    intro: string;
    cvLabel: string;
    panelHeading: string;
    /** Solo EN (panel con mailto en lugar de formulario). */
    panelIntro?: string;
    useForm: boolean;
    ctaLabel?: string;
    ctaSubject?: string;
  };
};

/**
 * Diccionario español — fuente de verdad del tipo. Los literales se trasladan
 * **tal cual** desde los componentes (referencias por tarea). Nada se reescribe.
 */
export const es: Dictionary = {
  nav: {
    home: "Inicio",
    projects: "Proyectos",
    laboratory: "Laboratorio",
    cv: "CV",
    contact: "Contacto",
    search: "Buscar en el sitio (Ctrl+K)",
  },
  hero: {
    availability: "Abierto a oportunidades",
    role: "Ingeniero Civil Metalúrgico · Universidad de Concepción",
    manifesto: { lines: ["Comprender el proceso."], accent: "Transformar la decisión." },
    description:
      "Conecto metalurgia, simulación y datos para abordar desafíos de ingeniería. De la evidencia experimental al modelo; del modelo a una decisión trazable.",
    primaryCta: "Explorar mi trabajo",
    downloadCta: "Descargar CV",
    location: "Concepción, Chile — Movilidad nacional",
    scrollHint: "Baja para conocer mi enfoque",
    tag: "PORTAFOLIO / 2026",
    portraitAlt: "Pablo Garrido, Ingeniero Civil Metalúrgico",
    portraitCaption: ["INGENIERÍA CON FUNDAMENTO", "36°49′ S · 73°03′ O"],
    portraitNoteEyebrow: "Foco profesional",
    portraitNote: { lines: ["Procesos.", "Simulación."], accent: "Datos." },
  },
  about: {
    eyebrow: "01 / El enfoque",
    heading: { lines: ["La ingeniería empieza", "con una buena"], accent: "pregunta." },
    paragraphs: [
      "¿Qué ocurre dentro de un mineral, un flujo o un conjunto de datos? Mi trabajo empieza por entenderlo.",
      "Soy Ingeniero Civil Metalúrgico, titulado con Distinción Máxima y estudiante de Magíster en la Universidad de Concepción. Mi recorrido une investigación en CODELCO, modelamiento CFD y desarrollo de soluciones digitales.",
      "Busco aportar en ingeniería de procesos y proyectos, simulación y analítica aplicada a minería. Con rigor experimental, curiosidad y herramientas para convertir evidencia en criterio técnico.",
    ],
  },
  stats: [
    { value: "20", label: "Simulaciones CFD documentadas" },
    { value: "46", label: "Estudiantes formados en software de ingeniería" },
    { value: "220+", label: "Horas de capacitación certificadas" },
  ],
  story: {
    eyebrow: "02 / Una mirada conectada",
    heading: { lines: ["Un proceso."], accent: "Muchas perspectivas." },
    instrumentLabel: "PEGM / ESTUDIO CONCEPTUAL",
    svgTitle: "Ilustración conceptual de flujo",
    ariaSection: "Mi enfoque: procesos, simulación y datos",
    ariaNav: "Etapas del enfoque",
    chapters: [
      // ← trasladar TAL CUAL los 4 objetos de `spanishChapters` (process-story.tsx:5-54)
    ],
  },
  projects: {
    eyebrow: "03 / Trabajo seleccionado",
    heading: { lines: ["De la pregunta"], accent: "al proyecto." },
    ctaAll: "Ver todos los proyectos",
    footnote:
      "Las ilustraciones son conceptuales. Los alcances y cifras corresponden al CV; no representan resultados confidenciales ni simulaciones en ejecución.",
    artFootnotes: ["MINERAL × SOLUCIÓN", "GEOMETRÍA × FLUJO", "DATOS × HERRAMIENTAS"],
  },
  career: {
    show: true,
    eyebrow: "04 / Trayectoria",
    heading: { lines: ["Aprender.", "Modelar."], accent: "Aportar." },
    intro: "Industria, investigación y tecnología: un recorrido que sigue construyéndose.",
    cta: "CV completo",
  },
  lab: {
    eyebrow: "05 / Ingeniería que puedes explorar",
    heading: "Laboratorio digital",
    intro:
      "Una forma de compartir conocimiento: modelos didácticos interactivos para explorar fundamentos metalúrgicos.",
    mode: "links",
    links: [
      { n: "01", title: "Cinética de flotación", detail: "Tiempo, velocidad y recuperación", href: "flotacion", formula: "R(t)" },
      { n: "02", title: "Balance de masa", detail: "Conservación en dos productos", href: "balance", formula: "F = C + T" },
      { n: "03", title: "Diagrama Eh-pH del cobre", detail: "Explora regiones de estabilidad", href: "pourbaix", formula: "Eh / pH" },
    ],
    footnote:
      "Modelos simplificados para exploración y aprendizaje; requieren validación específica antes de cualquier uso operacional.",
  },
  contact: {
    eyebrow: "06 / Lo que viene",
    heading: { lines: ["¿Un desafío", "para abordar"], accent: "juntos?" },
    intro:
      "Abierto a oportunidades en procesos, proyectos, CFD y analítica aplicada. Disponible para movilidad nacional, terreno y colaboración interdisciplinaria.",
    cvLabel: "Ver CV",
    panelHeading: "Hablemos de la oportunidad",
    useForm: true,
  },
};
```

Nota: al trasladar, verificar las etiquetas de `stats` contra `content.ts` (la portada actual
usa `content.stats`); si difieren, manda `content.ts` para ES.

### Tarea 7.2 — Diccionario EN

**Archivo nuevo:** `src/lib/i18n/en.ts`

```ts
import type { Dictionary } from "@/lib/i18n/es";

/** Diccionario inglés — contenido actual de `/en` y `englishChapters`, sin cambios. */
export const en: Dictionary = {
  nav: {
    home: "Home",
    projects: "Projects",
    laboratory: "Laboratory",
    cv: "CV",
    contact: "Contact",
    search: "Search the site (Ctrl+K)",
  },
  hero: {
    availability: "Open to opportunities",
    role: "Metallurgical Engineer · Universidad de Concepción",
    manifesto: { lines: ["Understand the process."], accent: "Inform the decision." },
    description:
      "I connect metallurgy, simulation and data to tackle engineering challenges. From experimental evidence to numerical models, and from models to traceable technical decisions.",
    primaryCta: "Explore my work",
    downloadCta: "Download CV (Spanish)",
    location: "Concepción, Chile — Available for relocation within Chile",
    scrollHint: "Scroll to discover my approach",
    tag: "PORTFOLIO / 2026",
    portraitAlt: "Pablo Garrido, Metallurgical Engineer",
    portraitCaption: ["ENGINEERING WITH EVIDENCE", "36°49′ S · 73°03′ W"],
    portraitNoteEyebrow: "Professional focus",
    portraitNote: { lines: ["Processes.", "Simulation."], accent: "Data." },
  },
  about: {
    eyebrow: "01 / The approach",
    heading: { lines: ["Engineering starts", "with a good"], accent: "question." },
    paragraphs: [
      "What happens inside a mineral, a flow or a dataset? Understanding comes first.",
      "I graduated in Metallurgical Engineering with highest distinction from Universidad de Concepción, where I am currently pursuing a master’s degree in mineral processing.",
      "My experience spans experimental hydrometallurgical research at CODELCO, CFD studies of porous media and minihydrocyclones, and independent software development. I am interested in process engineering, engineering projects, simulation and applied analytics.",
      "Spanish native; estimated B2 English, with strong technical reading skills.",
    ],
  },
  stats: [
    { value: "20", label: "Documented CFD simulations" },
    { value: "46", label: "Students taught engineering software" },
    { value: "220+", label: "Certified training hours" },
  ],
  story: {
    eyebrow: "02 / A connected perspective",
    heading: { lines: ["One process."], accent: "Many perspectives." },
    instrumentLabel: "PEGM / CONCEPTUAL STUDY",
    svgTitle: "Conceptual flow illustration",
    ariaSection: "My approach: processes, simulation and data",
    ariaNav: "Approach chapters",
    chapters: [
      // ← trasladar TAL CUAL los 4 objetos de `englishChapters` (process-story.tsx:56-105)
    ],
  },
  projects: {
    eyebrow: "03 / Selected work",
    heading: { lines: ["From questions"], accent: "to projects." },
    ctaAll: "See all projects",
    footnote:
      "Illustrations are conceptual. Project scopes and figures are sourced from my CV, not confidential results or live simulations.",
    artFootnotes: ["CONCEPTUAL ILLUSTRATION"],
    items: [
      // ← trasladar TAL CUAL los 3 objetos de en/page.tsx:151-169, mapeando
      //   { title, context → meta, text → summary, tags } y añadiendo id: "en-1"|"en-2"|"en-3"
    ],
  },
  career: {
    show: false,
    eyebrow: "04 / Career",
    heading: { lines: ["Learn.", "Model."], accent: "Contribute." },
    intro: "Industry, research and technology: a journey still being built.",
    cta: "Full CV",
  },
  lab: {
    eyebrow: "04 / Explore the fundamentals",
    heading: "Digital laboratory",
    intro:
      "Interactive educational models for flotation kinetics, two-product mass balances and the copper Eh-pH diagram.",
    mode: "cta",
    ctaLabel: "Explore the laboratory (Spanish)",
    ctaHref: "/laboratorio",
    footnote:
      "Simplified educational models; application to operations requires specific validation.",
  },
  contact: {
    eyebrow: "05 / What comes next",
    heading: { lines: ["A challenge", "we can tackle"], accent: "together?" },
    intro:
      "Open to roles in process engineering, projects, CFD and applied data analytics. Available for fieldwork and relocation within Chile.",
    cvLabel: "Full CV (Spanish)",
    panelHeading: "Let’s start a conversation.",
    panelIntro:
      "Send me an email with the role, project or technical challenge you have in mind.",
    useForm: false,
    ctaLabel: "Get in touch",
    ctaSubject: "Professional opportunity",
  },
};
```

Nota EN: el CTA real de descarga es `Download CV (Spanish)` (en/page.tsx:53), tal cual.

### Tarea 7.3 — `Portfolio` compartido

**Archivo:** `src/components/portfolio.tsx` — reescritura con props:

```ts
type PortfolioProps = {
  settings: SiteSettings;
  dict: Dictionary;
  lang?: "en";
  role: string;
  stats: { value: string; label: string }[];
  about: AboutSection;
  projects: FeaturedProject[];
  experience?: Array<{ id: number; period: string; role: string; company: string; highlight: string }>;
};
```

Reglas de render (conservan el DOM/clases actuales de `portfolio.tsx`):

1. Raíz: `<div className="portfolio" lang={lang}>`.
2. Helper local `HeadlineBlock({ headline })` → líneas con `<br />` y la última en `<em>`
   (idéntico al markup actual).
3. Hero: chip con `dict.hero.availability`; rol con la prop `role`; manifiesto, descripción
   y CTAs con los textos de `dict.hero`. El CTA primario apunta a `#${dict.projects.anchor}`
   y el «conoce mi enfoque» a `#${dict.about.anchor}` (ver delta de tipo al final).
4. Sobre mí: `about.heading` string → `<h2>{heading}</h2>`; Headline → art. Párrafos con
   primer `<p className="lead-copy">`. El link de cierre «Conocer mi trayectoria completa»
   (solo ES; en/page.tsx:122 no lo tiene) se pinta si `about.cta` está definido (delta de tipo).
5. Stats desde la prop.
6. `<ProcessStory story={dict.story} />`.
7. Proyectos: id `dict.projects.anchor`; tarjetas desde la prop `projects`; `artFootnote` =
   `dict.projects.artFootnotes[i] ?? dict.projects.artFootnotes[0]`; CTA `dict.projects.ctaAll`.
8. Trayectoria: renderizar solo si `dict.career.show && experience.length > 0`.
9. Laboratorio: id fijo `laboratorio` (ambos idiomas lo comparten); `mode === "links"` pinta
   las tarjetas (`dict.lab.links`), `mode === "cta"` pinta el botón
   (`dict.lab.ctaLabel`/`ctaHref`).
10. Contacto: id `dict.contact.id`; panel derecho `useForm` → `<ContactForm />`; si no,
    `panelIntro` + botón `mailto:${settings.email}?subject=...` con `ctaLabel` (markup de
    en/page.tsx:262-271).

**Delta de tipo adicional** (añadir a `Dictionary` en `es.ts`):

```ts
about: { ...; anchor: string; cta?: string };
projects: { ...; anchor: string };
contact: { ...; id: string };
```

Valores: `about.anchor` `"sobre-mi"`/`"about"`; `about.cta` `"Conocer mi trayectoria completa"`
/ `undefined`; `projects.anchor` `"proyectos"`/`"projects"`; `contact.id` `"contacto"`/`"contacto"`
(EN usa el mismo id; su link interno del hero apunta a `#contacto` igual que hoy).

### Tarea 7.4 — Páginas

**Archivo:** `src/app/(site)/page.tsx` — conservar `metadata`/`revalidate`/`alternates`
actuales; el componente pasa a:

```tsx
import { Portfolio } from "@/components/portfolio";
import { getExperience, getProjects, getSettings } from "@/lib/data";
import { es } from "@/lib/i18n/es";

export default async function HomePage() {
  const [settings, projects, experience] = await Promise.all([
    getSettings(),
    getProjects(),
    getExperience(),
  ]);

  const role = settings.title
    ? `${settings.title} · Universidad de Concepción`
    : es.hero.role;

  const about = {
    eyebrow: es.about.eyebrow,
    anchor: es.about.anchor,
    cta: es.about.cta,
    heading: settings.aboutHeading || es.about.heading,
    paragraphs:
      settings.aboutParagraphs.length > 0 ? settings.aboutParagraphs : es.about.paragraphs,
  };

  const featured = projects
    .filter((project) => project.featured)
    .map((project) => ({
      id: String(project.id),
      meta: `${project.category} / ${project.year}`,
      title: project.title,
      summary: project.summary,
      tags: project.tags,
    }));

  return (
    <Portfolio
      settings={settings}
      dict={es}
      role={role}
      stats={es.stats}
      about={about}
      projects={featured}
      experience={experience.map((item) => ({
        id: item.id,
        period: item.period,
        role: item.role,
        company: item.company,
        highlight: item.highlights[0] ?? "",
      }))}
    />
  );
}
```

**Archivo:** `src/app/(site)/en/page.tsx` — conservar el `metadata` (líneas 9-20) y reescribir
el componente:

```tsx
import { Portfolio } from "@/components/portfolio";
import { en } from "@/lib/i18n/en";
import { getSettings } from "@/lib/data";

export default async function EnglishPortfolio() {
  const settings = await getSettings();
  return (
    <Portfolio
      lang="en"
      settings={settings}
      dict={en}
      role={en.hero.role}
      stats={en.stats}
      about={{ ...en.about, anchor: en.about.anchor }}
      projects={en.projects.items ?? []}
    />
  );
}
```

El `<div lang="en">` de hoy queda cubierto por la prop `lang` de `Portfolio`.

### Tarea 7.5 — `ProcessStory` con prop `story`

**Archivo:** `src/components/process-story.tsx`

- Eliminar `spanishChapters` y `englishChapters` (quedan en los diccionarios).
- Firma: `export function ProcessStory({ story }: { story: StoryDict })`.
- Reemplazos: `const chapters = story.chapters;`; `aria-label={story.ariaSection}`;
  eyebrow `story.eyebrow`; `<h2>` con `story.heading` (`HeadlineBlock`); instrumento
  `story.instrumentLabel`; `<title>{story.svgTitle}</title>`; `aria-label={story.ariaNav}`.
- Import del tipo: `import type { StoryDict } from "@/lib/i18n/es";`

### Tarea 7.6 — `site-header` con diccionario

**Archivo:** `src/components/site-header.tsx` — `const dict = english ? en : es;` (imports
`es`/`en`); los `labels` de `links` pasan a `dict.nav.*`; el botón de búsqueda usa
`dict.nav.search`; el botón de contacto `dict.nav.contact`. Nota: al ser client component,
ambos diccionarios viajan al cliente (solo strings; aceptable).

**Fuera de alcance (documentado):** `SiteFooter`, `ContactForm`, `AnalyticsTracker` y
`/cv` quedan en español; el palette mantiene sus literales ES (nota de desviación 8).

### Tarea 7.7 — Verificación del bloque 7

```bash
npm run lint
npm run type-check
npm test
npm run test:e2e
```

Criterios E2E: `public.spec` (rol desde `settings.title`, "Laboratorio digital", "al
proyecto"), `portfolio.spec` (nav de capítulos con métrica "12", vista móvil 390×844, /en
carga y conserva `lang="en"`), palette intacta. Manual: comparar `/` y `/en` contra las
capturas actuales — **ningún texto debe cambiar**, solo el código de origen.

**Commit:** `refactor: i18n por diccionarios tipados y portada compartida es/en`

---

## Extra — ADR y nota superseded

### Tarea ADR.1 — `docs/adr/0001-mantener-next-turso.md`

**Contenido:**

```md
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
```

### Tarea ADR.2 — Nota superseded del spec antiguo

Añadir al inicio de `docs/superpowers/specs/2026-08-14-pegm-metallurgical-platform-design.md`:

```md
> **Nota (2026-10-16):** este diseño quedó **superseded** por
> `docs/superpowers/specs/2026-10-16-pegm-hardening-design.md` (endurecimiento, bloques 1–7)
> y su plan `docs/superpowers/plans/2026-10-16-pegm-hardening.md`. Se conserva como registro
> histórico; no ejecutar tareas de este documento.
```

**Commit:** `docs: ADR de stack y nota superseded del spec anterior`

---

## Verificación final global

```bash
npm run lint          # biome (src scripts tests)
npm run type-check    # tsc --noEmit
npm test              # vitest
npm run build         # producción (CSP + llms.txt prerenderizado)
npm run test:e2e      # 23 pruebas + las nuevas del bloque 6
```

Criterios de cierre:
- Los 8 bloques commiteados en orden (1→7 + ADR), cada uno con su verificación verde.
- `git log --oneline` muestra un commit por bloque, sin cambios sin commitear.
- Manual final: login → panel → cambiar contraseña (sesión actual sigue viva) → auditoría
  con chips/paginación → mensaje de contacto con rate limit → `/llms.txt` en el build →
  `/en` idéntico en contenido al estado previo → paleta con ESC/clic-fuera/Ctrl+K.
