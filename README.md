# Pablo Garrido — Procesos, CFD y analítica de datos

Portafolio profesional con un recorrido visual al hacer scroll, perfil en español
y portada en inglés (`/en`). El contenido en `src/lib/content.ts` procede del CV
maestro: CODELCO, investigación CFD, formación y desarrollo de software.
METSIM se presenta como formación básica y JKSimMet como próximo aprendizaje.

La foto pública vive en `public/pablo-garrido-sin-reflejo.png`. El CV descargable es una versión
profesional sin los datos de contacto de las referencias; el maestro permanece privado
fuera de `public/`. Para regenerarlo desde `/cv`, con el servidor de desarrollo activo:

```bash
pnpm cv:pdf
```

La portada en inglés tiene contenido editorial propio; las páginas detalladas de CV,
proyectos, laboratorio y panel siguen en español. Antes de publicar, configurar el
dominio en `NEXT_PUBLIC_SITE_URL` y las variables de producción de [DEPLOY.md](./DEPLOY.md).
El enlace de LinkedIn se oculta hasta introducir la URL real en Ajustes.

El sitio conserva el panel y el formulario con SQLite local/Turso. No hay servicios
de analítica ni IA de pago activados por defecto.

Sitio web personal, portafolio y **laboratorio metalúrgico interactivo** de
**Pablo**, Ingeniero Civil Metalúrgico (Concepción, Chile) — con **panel de
administración completo** para editar todo el contenido sin tocar código.

## ✨ Qué incluye

### Rutas

<!-- BEGIN:docs-sync:routes -->
| Ruta | Tipo |
|---|---|
| `/` | Página |
| `/admin` | Página |
| `/admin/ajustes` | Página |
| `/admin/analitica` | Página |
| `/admin/auditoria` | Página |
| `/admin/educacion` | Página |
| `/admin/experiencia` | Página |
| `/admin/habilidades` | Página |
| `/admin/login` | Página |
| `/admin/mensajes` | Página |
| `/admin/proyectos` | Página |
| `/api/analytics` | API |
| `/cv` | Página |
| `/en` | Página |
| `/laboratorio` | Página |
| `/llms.txt` | API |
| `/proyectos` | Página |
<!-- END:docs-sync:routes -->

Extras: **modo oscuro** (con persistencia y sin parpadeo), **paleta de
comandos** (`Ctrl/⌘ + K`), animaciones al hacer scroll, SEO (sitemap, robots,
JSON-LD), fuentes autoalojadas.

### Laboratorio (`/laboratorio`)
Programado **desde cero** (SVG puro, sin librerías de gráficos):
1. **Cinética de flotación** — modelo de primer orden con controles en vivo
2. **Balance de masa** — fórmula de dos productos con mini-diagrama Sankey
3. **Diagrama Eh-pH (Pourbaix) del cobre** — fronteras de Nernst, retícula
   interactiva y detección de especie dominante (punto-en-polígono)
4. **Planta en vivo** — instrumentación virtual con 6 métricas y sparklines

### Panel de administración (`/admin`)
- Autenticación propia: **scrypt** (hash) + **JWT HS256** en cookie `HttpOnly`
  + middleware Edge que protege todas las rutas
- **Dashboard** con estadísticas, últimos mensajes y actividad
- CRUD completo: proyectos, experiencia, educación, certificaciones,
  idiomas, habilidades y ajustes del sitio (identidad, contacto, "sobre mí")
- **Bandeja de mensajes** del formulario de contacto (leído/no leído, borrar)
- **Auditoría** de todas las acciones del panel
- Cambio de contraseña desde Ajustes

## 🛠️ Stack (SOTA)

<!-- BEGIN:docs-sync:stack -->
| Herramienta | Versión | Rol |
|---|---|---|
| Next.js | 16.3.8 | Framework App Router, Server Actions, ISR, proxy (Turbopack) |
| React | 19.3.0 | UI |
| TypeScript | 7.0.2 | Tipado estricto (compilador nativo) |
| Tailwind CSS | 4.3.3 | Estilos con tema claro/oscuro (variables CSS) |
| Drizzle ORM | 0.45.3 | libSQL tipado + migraciones + semilla automática |
| Turso / libSQL | 0.18.0 | SQLite en la nube (producción) o archivo local (desarrollo) |
| Biome | 2.5.15 | Linter + formatter (un solo binario, sin Babel) |
| lefthook | 2.2.2 | Hook de pre-commit (docs:check) |
| Vitest | 5.0.3 | Tests unitarios |
| Playwright | 1.63.0 | Tests E2E |
| Zod | 4.6.5 | Validación de entradas en server actions |
| jose | 6.2.12 | JWT HS256 de sesiones (compatible con proxy runtime) |
| scrypt | — | Hash de contraseñas sin dependencias (Node crypto) |
<!-- END:docs-sync:stack -->

Fuentes: **Fraunces** (serif) + **Inter** — autoalojadas con `@fontsource`.

## 📁 Estructura

```
├── src/
│   ├── app/
│   │   ├── (site)/            # Sitio público (layout con header/footer/paleta)
│   │   │   ├── page.tsx       # Portada
│   │   │   ├── cv/            # CV
│   │   │   ├── proyectos/     # Portafolio
│   │   │   └── laboratorio/   # Herramientas interactivas
│   │   ├── admin/
│   │   │   ├── (auth)/login/  # Inicio de sesión
│   │   │   └── (panel)/       # Panel protegido (dashboard, CRUD, mensajes…)
│   │   ├── layout.tsx         # Raíz: fuentes, tema, metadata
│   │   ├── robots.ts · sitemap.ts
│   ├── components/            # UI pública + admin + lab/ (4 herramientas)
│   ├── db/                    # Esquema Drizzle, conexión libSQL/Turso y semilla
│   ├── lib/
│   │   ├── content.ts         # ⭐ Contenido inicial (semilla)
│   │   ├── data.ts            # Consultas (con degradación elegante si no hay DB)
│   │   ├── actions/           # Server Actions (auth, contenido, mensajes)
│   │   ├── auth.ts            # JWT (compatible Edge) · password.ts (scrypt)
│   │   └── slug.ts
│   └── middleware.ts          # Protección de /admin
├── drizzle/                   # Migraciones SQL
├── data/site.db               # Base de datos (gitignored, se auto-crea)
└── scripts/                   # Utilidades Node (DB, E2E, CV, deploy, docs-sync)
```

## 🚀 Desarrollo

```bash
pnpm install           # dependencias (libSQL trae binarios precompilados)
cp .env.example .env.local   # y editar AUTH_SECRET
pnpm dev               # → http://localhost:3000
```

Sin variables de Turso, la base de datos es **SQLite local** (`data/site.db`) y se
**crea y siembra sola** en el primer arranque (migraciones + contenido inicial de
`src/lib/content.ts` + usuario admin). Con `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`
definidos, la misma lógica corre contra **Turso** (persistente en serverless).

**Acceso al panel:** `/admin` → `admin@pablo.cl` / `admin1234`
*(credenciales por defecto: cámbialas en Ajustes → Contraseña)*

Más comandos del proyecto:

<!-- BEGIN:docs-sync:commands -->
| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo en :3000 (Turbopack) |
| `pnpm build` | Build de producción (Next.js) |
| `pnpm start` | Servidor de producción en :3000 |
| `pnpm type-check` | TypeScript estricto (tsc --noEmit) |
| `pnpm test` | Pruebas unitarias (Vitest) |
| `pnpm test:watch` | Pruebas unitarias en modo watch |
| `pnpm lint` | Biome: lint + formato (src, scripts, tests) |
| `pnpm lint:fix` | Biome con corrección automática |
| `pnpm format` | Biome: solo formato |
| `pnpm check:agents` | Verificación multiagente (AGENTS.md, adaptadores, skills, packageManager pnpm) |
| `pnpm check:scripts` | Verificar scripts (sintaxis de todos los .mjs + importación de los módulos curados) |
| `pnpm docs:sync` | Regenerar los bloques de documentación viva |
| `pnpm docs:check` | Verificar la documentación viva (candado de CI) |
| `pnpm db:generate` | Generar migración Drizzle |
| `pnpm db:studio` | Drizzle Studio (explorar la BD) |
| `pnpm db:reset` | Regenerar la DB local con datos semilla |
| `pnpm test:e2e` | Suite E2E (Playwright, puerto 3100, BD aislada) |
| `pnpm evals:run` | Motor de evals de agentes (run/validate/baseline) |
| `pnpm evals:report` | Generar informes de evals (evals/reports/) |
| `pnpm cv:pdf` | Regenerar el PDF público del CV (requiere dev activo) |
| `pnpm prepare` | Instalar el hook de pre-commit (lefthook) |
<!-- END:docs-sync:commands -->

### Variables de entorno (`.env.local`)

| Variable | Uso |
|---|---|
| `AUTH_SECRET` | Secreto para firmar sesiones (`openssl rand -hex 32`) — **obligatoria en producción** |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Solo al sembrar la DB la primera vez |
| `NEXT_PUBLIC_SITE_URL` | URL pública (sitemap, canonical, JSON-LD) — solo producción |

## ✏️ Cómo editar el contenido

- **Desde el panel** (`/admin`): todo el contenido se guarda en la base de
  datos y se refleja en el sitio público de inmediato (revalidación on-demand).
- **Contenido inicial** (usado para sembrar la DB y como respaldo si la DB no
  está disponible): `src/lib/content.ts`.
- **Colores/tema**: bloque `@theme` y `.dark` en `src/app/globals.css`.

## 🔒 Notas de seguridad y despliegue

- Sesiones: JWT HS256 en cookie `HttpOnly` + `SameSite=Lax` (+ `Secure` en producción).
- Contraseñas: scrypt con salt aleatorio por usuario (comparación en tiempo constante).
- Server Actions de administración validan la sesión en cada llamada y dejan
  registro en la auditoría. Next.js valida el origen de las acciones (anti-CSRF).
- Formulario de contacto: validación server-side + honeypot anti-bots.
- **Despliegue (Vercel + Turso)**: guía completa paso a paso en
  **[DEPLOY.md](./DEPLOY.md)** (~15 min, costo $0 con free tiers). Incluye:
  - `AUTH_SECRET` es **obligatoria** en producción (el sitio falla a propósito si falta).
  - `NEXT_PUBLIC_SITE_URL` alimenta sitemap, canonical y JSON-LD.
  - Verificación post-deploy: `node scripts/verify-deploy.mjs https://tu-dominio.cl`.
  - Headers de seguridad HTTP activos solo en build de producción.
  Sin DB remota configurada, el sitio sigue funcionando con SQLite local o el
  contenido semilla (degradación elegante).

## CI

`.github/workflows/ci.yml` ejecuta en cada push y pull request: lint (Biome),
tests unitarios (Vitest), verificación de tipos, build de producción y la suite
E2E completa de Playwright (con Chromium y reporte HTML como artefacto).
