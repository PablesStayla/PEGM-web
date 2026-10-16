# Harness Multiagente y Estabilidad — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar en la rama `feat/ai-native-harness` las mejoras P0–P2 de la misión AI-Native: arreglar el CI rojo (line endings LF), blindar las credenciales de semilla en producción, activar alertas de dependencias, y añadir verificación + documentación + skills del harness multiagente (Codex / Claude Code / Antigravity / OpenCode).

**Architecture:** Cambios aditivos y de configuración sobre el repo existente. Sin dependencias nuevas: el único código es un script Node de verificación (`scripts/agents-check.mjs`) con pruebas Vitest, cableado a un job nuevo de CI (`guards`). Las instrucciones canónicas siguen en `AGENTS.md` (ya es la fuente nativa para las 4 herramientas, verificado); el contrato completo vive en `docs/agentes.md`; las skills compartidas en `.agents/skills/`.

**Tech Stack:** Next.js 16 · TypeScript 7 · Biome · Vitest · Playwright · pnpm · GitHub Actions · Dependabot.

## Global Constraints

- Rama: `feat/ai-native-harness` en el worktree `C:\Users\Pablo\Desktop\Proyectos\PEGM-web-harness`. **Nunca** trabajar en `main`.
- pnpm exclusivamente (nunca npm/yarn/npx en scripts o docs del repo).
- UI y comentarios en español (es-CL); nombres de archivos y símbolos en inglés cuando ya lo hace el repo.
- Biome: comillas dobles, punto y coma, 100 columnas. Line endings **LF** en todo el repo (Task 1).
- No agregar dependencias (runtime ni dev). Todo con Node 22 estándar + Vitest/Biome existentes.
- No tocar el trabajo concurrente de la otra sesión (en `main`): `scripts/docs-sync.mjs`, `scripts/docs-sync.test.mjs`, `docs-data/*`, la futura sección de documentación viva, hooks lefthook ni `data/*.db`.
- Gates por tarea: `pnpm lint` · `pnpm test` · `pnpm run type-check`. Build completo en Task 8.
- Un commit temático por tarea, en español. Mensajes con acentos: archivo UTF-8 + `git commit -F` (PowerShell 5.1 mangletea args).
- Cada commit deja lint+test+type-check en verde.
- Ningún secreto real en el repo; documentos solo con placeholders.

## Evidencia base (reconocimiento ya verificado)

- **CI rojo**: run `38954571615` (rama `main`, commit `1c3cc7e`) → job `build` **falla en el step "Lint (Biome)"**; el job `e2e` pasa. (API pública de GitHub, verificado.)
- **Causa raíz (verificada empíricamente)**: `biome.json` tiene `"lineEnding": "crlf"`; los blobs del repo son LF (`git ls-files --eol` → 257 archivos `i/lf w/crlf`); en Ubuntu CI el checkout queda LF → Biome falla. Experimento local: el mismo archivo en LF hace fallar `biome check` (exit 1); en CRLF pasa (exit 0).
- **Binarios detectados por Git**: `perfil-sonrisa-sin-reflejo.png`, `public/cv-pablo-garrido.pdf`, `public/pablo-garrido-sin-reflejo.png`, `public/pablo-garrido.png`.
- **`pnpm audit --prod`** → "No known vulnerabilities found" (exit 0), hoy limpio.
- **`vitest.config.ts:7`** incluye `scripts/**/*.test.mjs` → los tests de scripts corren con `pnpm test`.
- **Compatibilidad multiagente (docs oficiales verificadas)**: Codex lee `AGENTS.md` (raíz + ancestros, override disponible); Claude Code lee `AGENTS.md` **si no existe** `CLAUDE.md`; Antigravity lee `AGENTS.md` o `GEMINI.md` (walk-up); OpenCode lee `AGENTS.md` (verificado además en esta instalación, que carga `.agents/skills/` directo). Conclusión: no hacen falta adaptadores; hace falta un guard anti-divergencia.
- **Baseline del worktree**: `pnpm lint` exit 0 (86 archivos) · `pnpm test` 41/41 · `pnpm run type-check` exit 0.

---

### Task 1: Política de finales de línea LF (arregla el CI rojo)

**Files:**
- Create: `.gitattributes`
- Modify: `biome.json` (línea del `lineEnding`)

**Interfaces:**
- Consumes: nada.
- Produces: política de EOL consistente; `w/lf` en el árbol de trabajo (los binarios ya eran `-text`).

- [ ] **Step 1: Crear `.gitattributes`**

```gitattributes
# Política de finales de línea: LF en el repositorio y en el árbol de trabajo,
# en todas las plataformas. Biome exige el mismo EOL (biome.json → lineEnding: "lf").
* text=auto eol=lf

# Binarios — nunca convertir
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
*.pdf binary
```

- [ ] **Step 2: Cambiar `biome.json` a LF**

En `biome.json`, reemplazar la línea `"lineEnding": "crlf"` por `"lineEnding": "lf"`.

- [ ] **Step 3: Renormalizar y verificar que no cambia ningún blob**

Run: `git add --renormalize .` y luego `git status --short`
Expected: solo `.gitattributes` y `biome.json` aparecen (los blobs ya eran LF; la renormalización es no-op).

- [ ] **Step 4: Commit**

```powershell
git add .gitattributes biome.json
# Mensaje vía archivo UTF-8:
Set-Content -Path "$env:TEMP\opencode\commit-msg-eol.txt" -Encoding utf8 -Value "fix(ci): unificar finales de linea en LF (.gitattributes + Biome)"
git commit -F "$env:TEMP\opencode\commit-msg-eol.txt"
```

(Ajustar el mensaje con "línea" acentuado en el archivo; aquí sin acento solo por seguridad de ejemplo.)

- [ ] **Step 5: Refrescar el árbol de trabajo para que sea LF**

Run: `git rm -r --cached . --quiet; if ($?) { git reset --hard --quiet }`
Expected: `git ls-files --eol` muestra `w/lf` para los archivos de texto (antes `w/crlf`).

- [ ] **Step 6: Verificar los gates**

Run: `pnpm lint` → exit 0 · `pnpm test` → 41/41 · `pnpm run type-check` → exit 0.
Verificación puntual del mecanismo: `pnpm exec biome check src/lib/slug.test.ts` → exit 0 con el archivo ahora en LF (antes del fix, LF hacía fallar este check).

---

### Task 2: Guard de credenciales de semilla en producción

**Files:**
- Create: `src/lib/seed-credentials.ts`
- Test: `src/lib/seed-credentials.test.ts`
- Modify: `src/db/seed.ts:25-26`
- Modify: `.env.example` (bloque ADMIN, líneas 9-13)

**Interfaces:**
- Consumes: nada.
- Produces: `resolveInitialAdminCredentials(env?: NodeJS.ProcessEnv): { email: string; password: string }` — usado por `src/db/seed.ts`.

- [ ] **Step 1: Escribir el test que falla**

`src/lib/seed-credentials.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { resolveInitialAdminCredentials } from "./seed-credentials";

describe("resolveInitialAdminCredentials", () => {
  it("usa credenciales por defecto fuera de producción", () => {
    expect(resolveInitialAdminCredentials({ NODE_ENV: "development" })).toEqual({
      email: "admin@pablo.cl",
      password: "admin1234",
    });
  });

  it("respeta las variables definidas fuera de producción", () => {
    expect(
      resolveInitialAdminCredentials({
        NODE_ENV: "test",
        ADMIN_EMAIL: "otro@pablo.cl",
        ADMIN_PASSWORD: "secreta-123456",
      }),
    ).toEqual({ email: "otro@pablo.cl", password: "secreta-123456" });
  });

  it("exige ADMIN_EMAIL y ADMIN_PASSWORD en producción", () => {
    expect(() => resolveInitialAdminCredentials({ NODE_ENV: "production" })).toThrowError(
      /ADMIN_EMAIL/,
    );
  });

  it("rechaza la contraseña por defecto en producción", () => {
    expect(() =>
      resolveInitialAdminCredentials({
        NODE_ENV: "production",
        ADMIN_EMAIL: "pablo@dominio.cl",
        ADMIN_PASSWORD: "admin1234",
      }),
    ).toThrowError(/por defecto/);
  });

  it("acepta credenciales explícitas en producción", () => {
    expect(
      resolveInitialAdminCredentials({
        NODE_ENV: "production",
        ADMIN_EMAIL: "pablo@dominio.cl",
        ADMIN_PASSWORD: "una-clave-larga-y-unica",
      }),
    ).toEqual({ email: "pablo@dominio.cl", password: "una-clave-larga-y-unica" });
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm vitest run src/lib/seed-credentials.test.ts`
Expected: FAIL — no existe `./seed-credentials`.

- [ ] **Step 3: Implementación mínima**

`src/lib/seed-credentials.ts`:

```ts
/**
 * Credenciales del administrador inicial (semilla).
 *
 * En desarrollo/test valen los valores por defecto. En producción son
 * obligatorias vía entorno y se rechaza la contraseña por defecto
 * (misma filosofía fail-fast que AUTH_SECRET en src/lib/auth.ts).
 */
const DEFAULT_ADMIN_EMAIL = "admin@pablo.cl";
const DEFAULT_ADMIN_PASSWORD = "admin1234";

export function resolveInitialAdminCredentials(
  env: NodeJS.ProcessEnv = process.env,
): { email: string; password: string } {
  const email = env.ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL;
  const password = env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  if (env.NODE_ENV === "production") {
    if (!email || !env.ADMIN_EMAIL?.trim() || !env.ADMIN_PASSWORD) {
      throw new Error(
        "En producción, ADMIN_EMAIL y ADMIN_PASSWORD son obligatorias para sembrar la base de datos. Defínelas en el entorno (Vercel → Settings → Environment Variables).",
      );
    }
    if (password === DEFAULT_ADMIN_PASSWORD) {
      throw new Error(
        "En producción, ADMIN_PASSWORD no puede ser la contraseña por defecto. Define una contraseña única y larga.",
      );
    }
  }

  return { email, password };
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm vitest run src/lib/seed-credentials.test.ts`
Expected: PASS (5/5).

- [ ] **Step 5: Cablear en la semilla**

En `src/db/seed.ts`, junto al resto de imports, añadir:

```ts
import { resolveInitialAdminCredentials } from "@/lib/seed-credentials";
```

y reemplazar las líneas 25-26:

```ts
    const email = process.env.ADMIN_EMAIL ?? "admin@pablo.cl";
    const password = process.env.ADMIN_PASSWORD ?? "admin1234";
```

por:

```ts
    const { email, password } = resolveInitialAdminCredentials();
```

- [ ] **Step 6: Endurecer `.env.example`**

Reemplazar el bloque (líneas 9-13):

```
# Credenciales del administrador.
# Solo se usan la PRIMERA vez que se crea la base de datos (semilla).
# Para cambiar la contraseña después, usar Panel → Ajustes.
ADMIN_EMAIL="admin@pablo.cl"
ADMIN_PASSWORD="admin1234"
```

por:

```
# Credenciales del administrador.
# Solo se usan la PRIMERA vez que se crea la base de datos (semilla).
# En producción son OBLIGATORIAS y no pueden ser los valores de ejemplo:
# la app falla al arrancar si faltan o si usan la contraseña por defecto.
# Para cambiar la contraseña después, usar Panel → Ajustes.
ADMIN_EMAIL=""
ADMIN_PASSWORD=""
```

- [ ] **Step 7: Gates y commit**

Run: `pnpm lint` · `pnpm test` (46/46 esperado: 41 + 5) · `pnpm run type-check`.
Commit (mensaje UTF-8): `feat(security): exigir credenciales de admin explicitas en produccion`.

---

### Task 3: Alertas de dependencias (Dependabot)

**Files:**
- Create: `.github/dependabot.yml`

**Interfaces:**
- Consumes: nada.
- Produces: PRs automáticos semanales (activación efectiva al mergear a `main`, la rama por defecto).

- [ ] **Step 1: Crear `.github/dependabot.yml`**

```yaml
version: 2

updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "America/Santiago"
    open-pull-requests-limit: 5
    commit-message:
      prefix: "chore(deps)"
    groups:
      menores-y-parches:
        patterns:
          - "*"
        update-types:
          - "minor"
          - "patch"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      timezone: "America/Santiago"
    commit-message:
      prefix: "chore(ci)"
```

- [ ] **Step 2: Commit**

Commit (mensaje UTF-8): `chore(ci): alertas semanales de dependencias con Dependabot`.

Nota: los "majors" quedan fuera del grupo a propósito (PR individual para revisión).

---

### Task 4: Verificación de consistencia multiagente + job `guards` en CI

**Files:**
- Create: `scripts/agents-check.mjs`
- Test: `scripts/agents-check.test.mjs`
- Modify: `package.json` (script `check:agents`)
- Modify: `.github/workflows/ci.yml` (job nuevo `guards`, al final)

**Interfaces:**
- Produces: `checkAgentsConfig(root?: string): { nivel: "ok" | "error"; mensaje: string }[]` (CLI: imprime ✓/✗ y sale 1 si hay errores). El test importa esta función desde `./agents-check.mjs`.

- [ ] **Step 1: Escribir el test que falla**

`scripts/agents-check.test.mjs`:

```js
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkAgentsConfig } from "./agents-check.mjs";

let root;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "agents-check-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function escribir(relativa, contenido) {
  const ruta = join(root, relativa);
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, contenido, "utf8");
}

function errores() {
  return checkAgentsConfig(root)
    .filter((hallazgo) => hallazgo.nivel === "error")
    .map((hallazgo) => hallazgo.mensaje);
}

const PKG_VALIDO = JSON.stringify({ packageManager: "pnpm@11.7.0" });

describe("checkAgentsConfig", () => {
  it("acepta una configuración sana", () => {
    escribir("AGENTS.md", "# Guía\n");
    escribir("package.json", PKG_VALIDO);
    escribir(
      ".agents/skills/ejemplo/SKILL.md",
      "---\nname: ejemplo\ndescription: Skill de ejemplo.\n---\n\n# Ejemplo\n",
    );
    expect(errores()).toEqual([]);
  });

  it("falla si falta AGENTS.md", () => {
    escribir("package.json", PKG_VALIDO);
    expect(errores().join("\n")).toMatch(/AGENTS\.md/);
  });

  it("falla si CLAUDE.md no importa AGENTS.md", () => {
    escribir("AGENTS.md", "# Guía\n");
    escribir("package.json", PKG_VALIDO);
    escribir("CLAUDE.md", "# Solo Claude\n");
    expect(errores().join("\n")).toMatch(/@AGENTS\.md/);
  });

  it("acepta CLAUDE.md que delega en AGENTS.md", () => {
    escribir("AGENTS.md", "# Guía\n");
    escribir("package.json", PKG_VALIDO);
    escribir("CLAUDE.md", "@AGENTS.md\n");
    expect(errores()).toEqual([]);
  });

  it("prohíbe GEMINI.md en la raíz", () => {
    escribir("AGENTS.md", "# Guía\n");
    escribir("package.json", PKG_VALIDO);
    escribir("GEMINI.md", "# Gemini\n");
    expect(errores().join("\n")).toMatch(/GEMINI\.md/);
  });

  it("exige packageManager con pnpm", () => {
    escribir("AGENTS.md", "# Guía\n");
    escribir("package.json", "{}");
    expect(errores().join("\n")).toMatch(/pnpm/);
  });

  it("valida el frontmatter de las skills", () => {
    escribir("AGENTS.md", "# Guía\n");
    escribir("package.json", PKG_VALIDO);
    escribir(".agents/skills/rota/SKILL.md", "# Sin frontmatter\n");
    expect(errores().join("\n")).toMatch(/frontmatter/);
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm vitest run scripts/agents-check.test.mjs`
Expected: FAIL — no existe `./agents-check.mjs`.

- [ ] **Step 3: Implementación mínima**

`scripts/agents-check.mjs`:

```js
/**
 * Verifica la consistencia de la configuración multiagente del repositorio:
 * AGENTS.md como fuente de verdad, adaptadores que delegan (no duplican),
 * packageManager pnpm y formato de las skills en .agents/skills/.
 *
 * Uso: node scripts/agents-check.mjs   (sale 1 si hay errores)
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export function checkAgentsConfig(root = process.cwd()) {
  const hallazgos = [];
  const ok = (mensaje) => hallazgos.push({ nivel: "ok", mensaje });
  const error = (mensaje) => hallazgos.push({ nivel: "error", mensaje });

  const agentsPath = join(root, "AGENTS.md");
  const agents = existsSync(agentsPath) ? readFileSync(agentsPath, "utf8") : "";
  if (agents.trim().length === 0) {
    error("Falta AGENTS.md o está vacío: es la fuente de verdad de instrucciones.");
  } else {
    ok("AGENTS.md presente (fuente de verdad).");
  }

  const claudePath = join(root, "CLAUDE.md");
  if (existsSync(claudePath)) {
    const claude = readFileSync(claudePath, "utf8");
    if (claude.includes("@AGENTS.md")) {
      ok("CLAUDE.md delega en AGENTS.md (@AGENTS.md).");
    } else {
      error(
        "CLAUDE.md existe pero no importa AGENTS.md (@AGENTS.md): Claude Code lo leería en lugar de la fuente de verdad.",
      );
    }
  }

  if (existsSync(join(root, "GEMINI.md"))) {
    error("GEMINI.md en la raíz: usa AGENTS.md como fuente de verdad (Antigravity lee ambos).");
  }

  let packageManager = "";
  try {
    packageManager = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).packageManager ?? "";
  } catch {
    error("No se pudo leer package.json.");
  }
  if (packageManager.startsWith("pnpm@")) {
    ok(`packageManager = ${packageManager}.`);
  } else {
    error("package.json debe fijar packageManager con pnpm (p. ej. pnpm@11.7.0).");
  }

  const skillsDir = join(root, ".agents", "skills");
  if (existsSync(skillsDir)) {
    for (const entrada of readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entrada.isDirectory()) continue;
      const skillPath = join(skillsDir, entrada.name, "SKILL.md");
      if (!existsSync(skillPath)) {
        error(`Skill ${entrada.name}: falta SKILL.md.`);
        continue;
      }
      const contenido = readFileSync(skillPath, "utf8");
      const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(contenido)?.[1] ?? "";
      const tieneNombre = /^name:\s*\S+/m.test(frontmatter);
      const tieneDescripcion = /^description:\s*\S+/m.test(frontmatter);
      if (tieneNombre && tieneDescripcion) {
        ok(`Skill ${entrada.name}: frontmatter válido.`);
      } else {
        error(`Skill ${entrada.name}: frontmatter sin name/description válidos.`);
      }
    }
  }

  return hallazgos;
}

const esEjecucionDirecta =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (esEjecucionDirecta) {
  const hallazgos = checkAgentsConfig();
  for (const { nivel, mensaje } of hallazgos) {
    console.log(`${nivel === "ok" ? "✓" : "✗"} ${mensaje}`);
  }
  const errores = hallazgos.filter((hallazgo) => hallazgo.nivel === "error").length;
  if (errores > 0) {
    console.error(`\n${errores} problema(s) de configuración multiagente.`);
    process.exit(1);
  }
  console.log("\nConfiguración multiagente consistente.");
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm vitest run scripts/agents-check.test.mjs`
Expected: PASS (7/7).

- [ ] **Step 5: Añadir el script a `package.json`**

Después de la línea `"format": "biome format --write src scripts tests",` añadir:

```json
    "check:agents": "node scripts/agents-check.mjs",
```

- [ ] **Step 6: Verificar contra el repo real**

Run: `pnpm run check:agents`
Expected: ✓ para AGENTS.md, packageManager y la skill existente (`modern-web-guidance`); exit 0. (Las skills nuevas llegan en Task 6 y también deben pasar.)

- [ ] **Step 7: Añadir el job `guards` a `.github/workflows/ci.yml`**

Al final del archivo, tras el job `e2e`:

```yaml
  guards:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Consistencia multiagente
        run: pnpm run check:agents

      - name: Auditoría de dependencias de producción
        run: pnpm audit --prod --audit-level=high
```

Nota de tradeoff (documentar en el informe final): el step de auditoría puede ponerse rojo si aparece un aviso nuevo en el registro; en ese caso el arreglo es el PR de Dependabot. Si resulta demasiado ruidoso, se puede quitar sin afectar al resto.

- [ ] **Step 8: Gates y commit**

Run: `pnpm lint` · `pnpm test` (53/53 esperado) · `pnpm run type-check` · `pnpm run check:agents`.
Commit (mensaje UTF-8): `feat(harness): verificacion multiagente y guardas de CI`.

---

### Task 5: `docs/agentes.md` — contrato y guía del harness

**Files:**
- Create: `docs/agentes.md`

**Interfaces:**
- Consumes: los hechos verificados del reconocimiento.
- Produces: documento de referencia enlazado desde `AGENTS.md` (Task 7).

- [ ] **Step 1: Crear `docs/agentes.md`**

```markdown
# Agentes y herramientas — guía del harness multiagente

Fuente de verdad de instrucciones: [AGENTS.md](../AGENTS.md). Este documento la
complementa con: compatibilidad por herramienta, contrato de ingeniería, flujo
multiagente y reglas de contexto. Mantenerlo corto y sincronizado.

## Cómo lee las instrucciones cada herramienta (verificado)

| Herramienta | Lee | Notas |
| --- | --- | --- |
| OpenAI Codex | `AGENTS.md` (raíz y ancestros) y `~/.codex/AGENTS.md` | Soporta `AGENTS.override.md`; rutas alternativas configurables. |
| Claude Code | `AGENTS.md` **solo si no existe** `CLAUDE.md` | Si existe `CLAUDE.md`, ese manda; puede delegar con `@AGENTS.md`. |
| Antigravity | `AGENTS.md` o `GEMINI.md` (ancestros) | Además `.agents/rules/*.md` con frontmatter; global `~/.gemini/AGENTS.md`. |
| OpenCode | `AGENTS.md` (raíz y `~/.config/opencode/AGENTS.md`) | Carga skills nativas desde `.agents/skills/` (verificado en esta máquina). |

**Consecuencia:** no se crean adaptadores. Si algún día hace falta uno
(p. ej. `CLAUDE.md`), debe **delegar** (`@AGENTS.md`) y nunca duplicar
instrucciones; `pnpm run check:agents` (job `guards` del CI) lo verifica.

Sin verificar aún (no asumir): lectura de `.agents/skills/` por Claude Code,
Codex y Antigravity; reglas `.agents/rules/` fuera de Antigravity.

## Skills compartidas

Formato: `.agents/skills/<nombre>/SKILL.md` con frontmatter `name` y `description`.

- `modern-web-guidance` — guía web moderna (frontend).
- `feature-workflow` — flujo end-to-end de funcionalidad (este repo).
- `security-review` — checklist de revisión de seguridad (este repo).
- `task-handoff` — empaquetar estado para transferir una tarea a otro modelo.

## Contrato de ingeniería (resumen operativo)

1. Reconocimiento antes de tocar código: entender archivos, contratos y datos reales.
2. Análisis de impacto arquitectónico (capa de datos, rutas, BD, render).
3. Decisiones explícitas: verificado vs. propuesto vs. supuesto.
4. Plan escrito para cambios no triviales (`docs/superpowers/plans/`).
5. Prueba que falla primero (TDD); implementación mínima después.
6. Cambios pequeños, un commit temático por intención.
7. Gates obligatorios: `pnpm lint` · `pnpm test` · `pnpm run type-check`.
8. `pnpm build` y `pnpm run test:e2e` cuando el cambio toca rutas, BD o render.
9. Documentación viva sincronizada en el mismo cambio (comandos, env, rutas).
10. Seguridad: sin secretos, guards de producción intactos, inputs validados con Zod.
11. Rendimiento/UX: no romper hidratación SSR ni añadir polling innecesario.
12. Revisión: PR con evidencia (salidas de gates) y riesgos; revisión independiente.
13. Iterar sobre la revisión hasta cerrar hallazgos; registrar lo diferido y por qué.
14. Sin deploy ni cambios destructivos sin autorización explícita.
15. Al cerrar: informe breve (qué, por qué, evidencia, pendientes).

## Flujo multiagente

- **Una sesión por worktree.** Si otra sesión trabaja en el repo, crear
  `git worktree add ../<repo>-<tema> -b <rama>` y trabajar ahí.
- Ramas: `feat/*`, `fix/*`, `docs/*`; `main` solo por PR con CI en verde.
- No sobrescribir trabajo concurrente: si un archivo lo está editando otra
  sesión (p. ej. documentación viva), coordinar por PR y resolver el merge
  en la rama, no en el árbol del otro.
- Transferencias entre modelos: skill `task-handoff` (formato de estado cerrado).
- El patrón SDD (`.superpowers/sdd/<tema>/progress.md`) sirve como bitácora
  local de tareas; es local (gitignored), no un entregable.

## Git y finales de línea

- **LF en todo**: `.gitattributes` (`* text=auto eol=lf`) + Biome
  (`lineEnding: "lf"`). Los binarios van marcados `binary`.
- Motivo verificado: el CI (Ubuntu) hace checkout LF; con Biome en CRLF el
  lint fallaba en GitHub. No cambiar esta política.
- Mensajes de commit en español; con acentos, usar archivo UTF-8 + `git commit -F`.

## Hooks y CI

- Hooks locales: lefthook (ver `lefthook.yml` si existe): lint y type-check
  antes de commit — los mismos gates que CI.
- CI (`.github/workflows/ci.yml`): jobs `build` (lint/tests/type-check/build),
  `e2e` (Playwright) y `guards` (consistencia multiagente + auditoría de
  dependencias de producción).
- Dependabot semanal (`.github/dependabot.yml`); los majors llegan como PR
  individual.
- Protección de rama recomendada para `main` (GitHub → Settings → Rules):
  PR obligatorio, checks requeridos `build` + `e2e` + `guards`, sin force-push.

## Reglas de contexto (economía de tokens)

- Preferir búsqueda dirigida (grafo/grep) sobre leer archivos completos.
- No pegar salidas gigantes: resumir con rutas + líneas.
- Cargar solo la skill relevante; no expandir docs enteras.
- MCP: hoy no hay servidores MCP propios conectados; se evalúa caso a caso
  (seguridad, mantenimiento y ruido de contexto) — no conectar por inercia.
- Este documento y `AGENTS.md` son el contexto externo canónico: mantenerlos
  cortos vale más que agregar detalle.
```

- [ ] **Step 2: Commit**

Commit (mensaje UTF-8): `docs(harness): guia de herramientas de agentes y contrato de ingenieria`.

---

### Task 6: Skills compartidas (`feature-workflow`, `security-review`, `task-handoff`)

**Files:**
- Create: `.agents/skills/feature-workflow/SKILL.md`
- Create: `.agents/skills/security-review/SKILL.md`
- Create: `.agents/skills/task-handoff/SKILL.md`

**Interfaces:**
- Consumes: formato de frontmatter validado por Task 4 (`check:agents`).
- Produces: skills cargables por OpenCode (nativo) y portables a las demás herramientas.

Justificación de alcance: se implementan 3 skills (flujo, seguridad, transferencia).
"Pruebas/verificación" y "revisión arquitectónica" quedan integradas como pasos de
`feature-workflow` (ya son gates del contrato, no necesitan skill propia);
"sincronización documental" es el sistema docs-sync de la otra sesión (se reutiliza).

- [ ] **Step 1: Crear `feature-workflow`**

```markdown
---
name: feature-workflow
description: Flujo end-to-end para desarrollar una funcionalidad o corrección en PEGM-web (reconocimiento, plan, TDD, gates, documentación y commits). Úsala al iniciar cualquier cambio no trivial.
---

# Flujo de funcionalidad (PEGM-web)

## Cuándo usarla
Cualquier cambio no trivial: feature, refactor o corrección con impacto.

## Pasos
1. Reconocimiento dirigido (grafo/grep/lecturas): archivos, contratos, riesgos.
2. Plan si toca ≥3 archivos o hay decisiones: `docs/superpowers/plans/` (skill
   writing-plans), con tareas bite-sized y commits temáticos.
3. Impacto arquitectónico: capa de datos (`src/lib/data.ts`), rutas, BD
   (migración + seed), revalidación (`revalidatePath`).
4. Aislamiento: rama `feat/*`/`fix/*`; worktree si hay otra sesión activa.
5. TDD: test que falla → implementación mínima → verde (`pnpm test`).
6. Gates: `pnpm lint` · `pnpm test` · `pnpm run type-check` (siempre);
   `pnpm build` y `pnpm run test:e2e` si toca rutas, BD o render.
7. Documentación viva: si cambian comandos/env/rutas, sincronizar en el mismo cambio.
8. Commit temático en español (acentos: archivo UTF-8 + `git commit -F`).
9. Cierre: informe breve con evidencia y riesgos; PR si aplica.

## Prohibido
- Commitear en `main`; npm/yarn; dependencias sin justificar; secretos;
  romper hidratación SSR; `Math.random()`/`Date.now()` en primer render cliente.
```

- [ ] **Step 2: Crear `security-review`**

```markdown
---
name: security-review
description: Revisión de seguridad enfocada para PEGM-web — secretos, autenticación, validación de entradas, base de datos, entorno y dependencias. Úsala antes de mergear cambios sensibles y como chequeo periódico.
---

# Revisión de seguridad (PEGM-web)

## Checklist
1. Secretos: nada hardcodeado; `AUTH_SECRET`/`ADMIN_*` solo por entorno;
   `.env*` fuera de git (salvo `.env.example` con placeholders).
2. Entorno: guards de producción intactos (`src/lib/auth.ts`,
   `src/lib/seed-credentials.ts`); los defaults de desarrollo jamás activos
   en producción.
3. Sesión: cookies httpOnly/secure, expiración; todo el panel admin detrás
   de sesión (`src/proxy.ts`, server actions).
4. Entradas: Zod en toda server action; nada de HTML crudo con datos de usuario.
5. BD: consultas Drizzle parametrizadas; nada de SQL concatenado; límites en
   consultas públicas.
6. Abuso: rate limiting en login y formularios públicos; errores sin filtrar
   stack ni internals.
7. Dependencias: `pnpm audit --prod --audit-level=high` limpio; PRs de
   Dependabot revisados antes de merge.
8. Egress: solo endpoints con sesión escriben BD; revalidación explícita tras
   escrituras.

## Formato de salida
- Hallazgo: severidad (alta/media/baja) · evidencia (`archivo:línea`) ·
  impacto · remediación sugerida.
- Si todo está limpio: decirlo explícitamente, separando verificado de no verificado.
```

- [ ] **Step 3: Crear `task-handoff`**

```markdown
---
name: task-handoff
description: Empaqueta el estado de una tarea para transferirla a otro modelo o sesión sin perder contexto (pausas, cambios de herramienta, delegación). Úsala antes de ceder el control.
---

# Transferencia de tareas entre modelos

## Formato obligatorio (≤ 1 página)
1. Objetivo (1 frase) y criterio de término.
2. Estado actual: rama, worktree, último commit; qué está verde y qué rojo.
3. Archivos relevantes (rutas exactas) y contratos tocados.
4. Decisiones y supuestos (1 línea c/u, con el porqué).
5. Pendientes priorizados, cada uno con su siguiente acción concreta.
6. Riesgos y bloqueos (incluye trabajo concurrente de otras sesiones).
7. Evidencia: comandos ejecutados y resultados clave.

## Reglas
- Incluir siempre el comando exacto para reproducir el estado (gates).
- Nunca transferir con árbol sucio sin listar lo no commiteado.
- Si otra sesión trabaja en paralelo: señalar rutas con conflicto esperado.
- Al recibir una transferencia: reproducir los gates ANTES de tocar código.
```

- [ ] **Step 4: Verificar con el guard y gates, y commitear**

Run: `pnpm run check:agents` (las 3 skills deben validar ✓) · `pnpm lint` · `pnpm test`.
Commit (mensaje UTF-8): `feat(harness): skills de flujo, seguridad y transferencia de tareas`.

---

### Task 7: `AGENTS.md` — sección de harness multiagente

**Files:**
- Modify: `AGENTS.md` (insertar antes de `<!-- BEGIN:nextjs-agent-rules -->`)

**Interfaces:**
- Consumes: `docs/agentes.md` (Task 5) y la skill `task-handoff` (Task 6).
- Produces: punteros canónicos para todas las herramientas.

- [ ] **Step 1: Insertar la sección**

Antes de la línea `<!-- BEGIN:nextjs-agent-rules -->`, añadir:

```markdown
## Harness multiagente

- **`AGENTS.md` es la fuente de verdad** para cualquier agente (Codex, Claude Code, Antigravity y OpenCode leen este archivo). No crear adaptadores; si hiciera falta uno, debe delegar (`@AGENTS.md`) — `pnpm run check:agents` lo verifica en CI.
- Contrato de ingeniería, flujo multiagente y reglas de contexto completos: **[docs/agentes.md](./docs/agentes.md)**.
- **Una sesión por worktree**: si otra sesión trabaja en el repo, usar `git worktree` con rama propia; nunca dos escritores en el mismo árbol.
- Transferencias entre modelos/sesiones: skill `task-handoff` (`.agents/skills/task-handoff/SKILL.md`).
- Finales de línea: **LF** en todo el repo (`.gitattributes` + Biome). No cambiar esa política.
```

Nota de concurrencia: la otra sesión edita este mismo archivo (Tarea 8 de docs-sync:
drift npm→pnpm). Mantener esta sección como bloque independiente facilita el merge;
resolver conflictos en el PR.

- [ ] **Step 2: Gates y commit**

Run: `pnpm run check:agents` · `pnpm lint` · `pnpm test` · `pnpm run type-check`.
Commit (mensaje UTF-8): `docs(harness): seccion multiagente en AGENTS.md`.

---

### Task 8: Verificación final, revisión independiente y PR

**Files:**
- Create: `docs/reports/2026-10-16-harness-entrega.md` (informe de entrega)
- Create (temporal): `$env:TEMP\opencode\pr-body.md` (cuerpo del PR)

**Interfaces:**
- Consumes: todas las tareas anteriores.
- Produces: rama pusheada, CI verde en la rama, PR (o URL de compare), informe final.

- [ ] **Step 1: Gates completos locales**

Run: `pnpm lint` · `pnpm test` · `pnpm run type-check` · `pnpm run check:agents`.
Run (build como en CI): `$env:AUTH_SECRET="build-local"; pnpm build; Remove-Item Env:\AUTH_SECRET`
Expected: todo verde. Anotar salidas para el informe.

- [ ] **Step 2: Revisión independiente (subagente)**

Cargar la skill `requesting-code-review` y despachar un subagente de revisión con:
- el diff `git diff main...HEAD` (base de la rama) y la lista de archivos;
- la misión (objetivo P0–P2) y las restricciones globales;
- preguntas: bugs, seguridad, simplicidad, consistencia con el repo,
  conflictos esperados con la otra sesión, violaciones de las políticas.
Registrar hallazgos; corregir los válidos con commits temáticos; anotar en el
informe lo diferido y por qué.

- [ ] **Step 3: Push de la rama**

Run: `git push -u origin feat/ai-native-harness`

- [ ] **Step 4: Verificar CI de la rama (evidencia del arreglo del rojo)**

Run: `webfetch https://api.github.com/repos/PablesStayla/PEGM-web/actions/runs?branch=feat/ai-native-harness&per_page=5`
Expected: runs del último commit con jobs `build`, `e2e` y `guards` en `success`.
Esto es la prueba de que la política LF elimina la falla "Lint (Biome)" que hoy
tiene `main` (run 38954571615).

- [ ] **Step 5: Crear el PR**

Intentar: `gh pr create --base main --head feat/ai-native-harness --title "..." --body-file $env:TEMP\opencode\pr-body.md`.
Si `gh` no está autenticado (401), dejar el body en `$env:TEMP\opencode\pr-body.md`
y entregar al usuario la URL:
`https://github.com/PablesStayla/PEGM-web/compare/main...feat/ai-native-harness?expand=1`

Cuerpo del PR (contenido de `pr-body.md`):
- Qué: arregla el CI rojo (LF), guard de credenciales de semilla en producción,
  Dependabot, `check:agents` + job `guards`, docs del harness y 3 skills.
- Por qué: misión AI-Native; evidencia del diagnóstico del run 38954571615.
- Evidencia: gates locales + run de CI de la rama.
- Conflictos esperados con la otra sesión (docs-sync): `AGENTS.md`, `ci.yml`,
  `package.json` — resolver al mergear después de sus Tasks 4-9.
- Post-merge obligatorio en el árbol local de `main`: refrescar EOL
  (`git rm -r --cached . --quiet; git reset --hard`) para que los archivos
  queden LF con la nueva política.

- [ ] **Step 6: Informe de entrega**

Crear `docs/reports/2026-10-16-harness-entrega.md` con: resumen (1 párrafo),
tabla de cambios por tarea, decisiones y por qué, evidencias (comandos +
resultados, URLs), riesgos/pendientes (auditoría en CI; `.agents/skills` sin
verificar en Claude/Codex/Antigravity; protección de rama propuesta y no
configurada; P3 no implementado — contexto/MCP diferidos con justificación),
e instrucciones de merge. Commit (mensaje UTF-8):
`docs: informe de entrega del harness multiagente` y push.

- [ ] **Step 7: Resumen final en chat**

Entregar al usuario: qué se hizo, archivos, decisiones, pruebas, riesgos,
siguiente paso (revisar PR; tras el cierre de la otra sesión: merge + refresco
EOL de `main` + reinstalación limpia P0 pendiente).

---

## Autoevaluación del plan (cobertura de la misión)

- §2/§11 P0 estabilidad: Task 1 (CI rojo → LF) y Task 4 (guards) — con evidencia.
- §7 seguridad: Task 2 (credenciales semilla + regresión) y Task 3 (dependencias).
- §3/§5 skills y harness: Tasks 4-7 (3 skills + doc + verificación en CI).
- §4 hooks: cubierto por la otra sesión (lefthook, Task 6 docs-sync); este plan
  documenta la política y no duplica (nota en docs/agentes.md).
- §8 calidad/CI: Task 4 (guards), Task 1 (EOL), protección de rama propuesta
  (doc + PR, no configurable sin permisos).
- §9 transferencia: skill `task-handoff` + sección en docs/agentes.md.
- §10 contexto: reglas en docs/agentes.md (no inflar AGENTS.md).
- §12/§13 DoD y entregables: Task 8 (revisión independiente, PR, informe, resumen).
- P1 (docs vivas): reutiliza el trabajo de la otra sesión — sin duplicar.
- P3 (autonomía avanzada): diferido consciente, con justificación en el informe.
