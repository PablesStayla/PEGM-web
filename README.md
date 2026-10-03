# Pablo — Ingeniero Civil Metalúrgico · Sitio personal

Sitio web personal, portafolio y **laboratorio metalúrgico interactivo** de
**Pablo**, Ingeniero Civil Metalúrgico (Concepción, Chile) — con **panel de
administración completo** para editar todo el contenido sin tocar código.

## ✨ Qué incluye

### Sitio público
| Ruta | Contenido |
|---|---|
| `/` | Portada: hero, quién soy, especialidades, laboratorio, proyectos destacados y formulario de contacto |
| `/cv` | CV completo: experiencia (timeline), educación, certificaciones, software e idiomas |
| `/proyectos` | Índice de proyectos y casos de estudio |
| `/proyectos/[slug]` | Caso editorial: contexto, desafío, enfoque, métricas, resultados y aprendizajes |
| `/laboratorio` | 4 herramientas metalúrgicas interactivas (ver abajo) |
| `/privacidad` | Tratamiento de mensajes, medición y derechos sobre los datos |
| `/api/health` | Estado operativo y conexión con la base de datos |

Extras: **visuales técnicos SVG propios para cada caso**, modo oscuro, paleta de
comandos (`Ctrl/⌘ + K`), animaciones progresivas, SEO (sitemap, robots, JSON-LD),
Vercel Analytics + Speed Insights, navegación por teclado y fuentes autoalojadas.

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
- **Dashboard** con estadísticas, actividad y checklist real de preparación para producción
- CRUD completo: proyectos y sus casos de estudio, experiencia, educación,
  certificaciones, idiomas, habilidades y ajustes del sitio (identidad, contacto, "sobre mí")
- **Bandeja de mensajes** del formulario de contacto (leído/no leído, borrar)
- **Auditoría** de todas las acciones del panel
- Cambio de contraseña desde Ajustes

## 🛠️ Stack (SOTA)

| Herramienta | Versión | Rol |
|---|---|---|
| **Next.js** | 16.x (Turbopack) | Framework App Router, Server Actions, ISR, proxy |
| **React** | 19.3 | UI |
| **TypeScript** | 7 (compilador nativo) | Tipado estricto |
| **Tailwind CSS** | 4.3 | Estilos con tema claro/oscuro (variables CSS) |
| **Drizzle ORM** | 0.45 | libSQL tipado + migraciones + semilla automática |
| **Turso / libSQL** | 0.18 | SQLite en la nube (producción) o archivo local (desarrollo) |
| **Biome** | 2.5 | Linter + formatter (un solo binario, sin Babel) |
| **Vitest** | 5 | Tests unitarios (23 pruebas: auth, matemática del laboratorio, slugs) |
| **Playwright + axe-core** | 1.63 | 29 E2E: flujos completos + auditoría WCAG A/AA en 7 rutas |
| **Vercel Analytics** | actual | Tráfico y Core Web Vitals sin cookies publicitarias |
| **Zod** | 4 | Validación de entradas en server actions |
| **jose** | 6 | JWT HS256 de sesiones (compatible con proxy runtime) |
| **scrypt** | Node crypto | Hash de contraseñas sin dependencias |

Fuentes: **Fraunces** (serif) + **Inter** — autoalojadas con `@fontsource`.

## 📁 Estructura

```
├── src/
│   ├── app/
│   │   ├── (site)/            # Sitio público (layout con header/footer/paleta)
│   │   │   ├── page.tsx       # Portada
│   │   │   ├── cv/            # CV
│   │   │   ├── proyectos/     # Portafolio + páginas de casos de estudio
│   │   │   ├── laboratorio/   # Herramientas interactivas
│   │   │   └── privacidad/    # Política clara de tratamiento de datos
│   │   ├── api/health/        # Monitor de aplicación + base de datos
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
│   └── proxy.ts               # Protección de /admin
├── drizzle/                   # Migraciones SQL
├── data/site.db               # Base de datos (gitignored, se auto-crea)
└── scripts/                   # reset · backup · verificación post-deploy
```

## 🚀 Desarrollo

```bash
npm install
cp .env.example .env.local   # y editar AUTH_SECRET
npm run dev            # → http://localhost:3000
```

Sin variables de Turso, la base de datos es **SQLite local** (`data/site.db`) y se
**crea y siembra sola** en el primer arranque (migraciones + contenido inicial de
`src/lib/content.ts` + usuario admin). Con `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`
definidos, la misma lógica corre contra **Turso** (persistente en serverless).

**Acceso al panel:** `/admin` → `admin@pablo.cl` / `admin1234`
*(credenciales por defecto: cámbialas en Ajustes → Contraseña)*

```bash
npm run build          # build de producción
npm run type-check     # verificación de tipos
npm run db:studio      # explorar la base de datos (Drizzle Studio)
npm run db:reset       # regenerar la DB con datos semilla
npm run db:backup      # export privado de contenido y mensajes (local o Turso)
```

### Variables de entorno (`.env.local`)

| Variable | Uso |
|---|---|
| `AUTH_SECRET` | Secreto para firmar sesiones (`openssl rand -hex 32`) — **obligatoria en producción** |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Solo al sembrar la DB la primera vez |
| `NEXT_PUBLIC_SITE_URL` | URL pública (sitemap, canonical, JSON-LD) — solo producción |

## ✏️ Cómo editar el contenido

- **Desde el panel** (`/admin`): todo el contenido se guarda en la base de
  datos y se refleja en el sitio público de inmediato (revalidación on-demand).
  En Proyectos puedes guardar una ficha breve o publicar un caso completo con
  slug propio, contexto, desafío, pasos, métricas, resultados y cierre.
- **Contenido inicial** (usado para sembrar la DB y como respaldo si la DB no
  está disponible): `src/lib/content.ts`.
- **Colores/tema**: bloque `@theme` y `.dark` en `src/app/globals.css`.

## 🔒 Notas de seguridad y despliegue

- Sesiones: JWT HS256 en cookie `HttpOnly` + `SameSite=Lax` (+ `Secure` en producción).
- Contraseñas: scrypt con salt aleatorio por usuario (comparación en tiempo constante).
- Server Actions de administración validan la sesión en cada llamada y dejan
  registro en la auditoría. Next.js valida el origen de las acciones (anti-CSRF).
- Login y contacto: validación server-side, honeypot y rate limiting distribuido en
  Turso; los identificadores se guardan como HMAC, nunca con la IP en claro.
- CSP, COOP, protección contra iframes/MIME sniffing y política de permisos.
- Política de privacidad pública, health check, backups privados y observabilidad.
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
