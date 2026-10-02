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
| `/proyectos` | Portafolio completo |
| `/laboratorio` | 4 herramientas metalúrgicas interactivas (ver abajo) |

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
| **Playwright** | 1.63 | Tests E2E (19 pruebas: sitio, laboratorio, panel, contacto) |
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
└── scripts/                   # reset-db.mjs · test-auth.mts
```

## 🚀 Desarrollo

```bash
npm install            # better-sqlite3 compila un módulo nativo (necesita build tools)
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
node --experimental-strip-types scripts/test-auth.mts   # pruebas de auth/DB
```

### Variables de entorno (`.env.local`)

| Variable | Uso |
|---|---|
| `AUTH_SECRET` | Secreto para firmar sesiones (`openssl rand -hex 32`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Solo al sembrar la DB la primera vez |

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
- **Despliegue (Vercel + Turso)**: el sitio ya es compatible con Turso.
  1. Crear la base: `turso db create pablo-site` (requiere cuenta gratuita)
  2. Obtener credenciales: `turso db show pablo-site --url` y `turso db tokens create pablo-site`
  3. En Vercel, definir: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
  4. Deployar. El primer arranque aplica migraciones y siembra el contenido en Turso.
  Sin DB remota configurada, el sitio sigue funcionando con SQLite local o el
  contenido semilla (degradación elegante).

## CI

`.github/workflows/ci.yml` ejecuta en cada push y pull request: lint (Biome),
tests unitarios (Vitest), verificación de tipos, build de producción y la suite
E2E completa de Playwright (con Chromium y reporte HTML como artefacto).
