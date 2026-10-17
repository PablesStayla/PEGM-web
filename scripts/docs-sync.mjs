import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Bloques de documentación viva: contenido generado entre marcadores.
// Formato: <!-- BEGIN:docs-sync:<bloque> --> … <!-- END:docs-sync:<bloque> -->

export const beginMarker = (name) => `<!-- BEGIN:docs-sync:${name} -->`;
export const endMarker = (name) => `<!-- END:docs-sync:${name} -->`;

const countOccurrences = (text, needle) => text.split(needle).length - 1;

export function replaceBlock(text, name, content) {
  const begin = beginMarker(name);
  const end = endMarker(name);
  const begins = countOccurrences(text, begin);
  const ends = countOccurrences(text, end);
  if (begins === 0 || ends === 0) {
    throw new Error(`falta el bloque "${name}" (BEGIN=${begins}, END=${ends})`);
  }
  if (begins > 1 || ends > 1) {
    throw new Error(`bloque "${name}" duplicado (BEGIN=${begins}, END=${ends})`);
  }
  const from = text.indexOf(begin);
  const endIndex = text.indexOf(end);
  if (endIndex < from) {
    throw new Error(`bloque "${name}" con marcadores invertidos`);
  }
  const to = endIndex + end.length;
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const body = content.length > 0 ? `${eol}${content.replace(/\r\n?|\n/g, eol)}${eol}` : eol;
  return text.slice(0, from) + begin + body + end + text.slice(to);
}

export function syncFile({ filePath, blocks, write }) {
  const problems = [];
  let text;
  try {
    text = readFileSync(filePath, "utf8");
  } catch (error) {
    return { changed: false, problems: [`${filePath}: no se pudo leer (${error.message})`] };
  }
  let next = text;
  for (const { name, content } of blocks) {
    try {
      next = replaceBlock(next, name, content);
    } catch (error) {
      problems.push(`${filePath} [${name}]: ${error.message}`);
    }
  }
  const changed = next !== text;
  if (changed && write) writeFileSync(filePath, next, "utf8");
  return { changed, problems };
}

// ————— Mapas curados (una entrada por script/variable/paquete; si falta, check falla) —————

export const SCRIPT_DOCS = {
  dev: "Servidor de desarrollo en :3000 (Turbopack)",
  build: "Build de producción (Next.js)",
  start: "Servidor de producción en :3000",
  "type-check": "TypeScript estricto (tsc --noEmit)",
  test: "Pruebas unitarias (Vitest)",
  "test:watch": "Pruebas unitarias en modo watch",
  lint: "Biome: lint + formato (src, scripts, tests)",
  "lint:fix": "Biome con corrección automática",
  format: "Biome: solo formato",
  "check:agents": "Verificación multiagente (AGENTS.md, adaptadores, skills, packageManager pnpm)",
  "check:scripts":
    "Verificar scripts (sintaxis de todos los .mjs + importación de los módulos curados)",
  "db:generate": "Generar migración Drizzle",
  "db:studio": "Drizzle Studio (explorar la BD)",
  "db:reset": "Regenerar la DB local con datos semilla",
  "test:e2e": "Suite E2E (Playwright, puerto 3100, BD aislada)",
  "evals:run": "Motor de evals de agentes (run/validate/baseline)",
  "evals:report": "Generar informes de evals (evals/reports/)",
  "cv:pdf": "Regenerar el PDF público del CV (requiere dev activo)",
  "docs:sync": "Regenerar los bloques de documentación viva",
  "docs:check": "Verificar la documentación viva (candado de CI)",
  prepare: "Instalar el hook de pre-commit (lefthook)",
};

export const ENV_DOCS = {
  AUTH_SECRET:
    "Secreto para firmar sesiones del panel (`openssl rand -hex 32`); **obligatoria en producción**",
  ADMIN_EMAIL: "Correo del administrador; solo al sembrar la DB por primera vez",
  ADMIN_PASSWORD: "Contraseña del administrador; solo al sembrar la DB por primera vez",
  TURSO_DATABASE_URL: "URL de Turso (`libsql://…`); sin ella se usa SQLite local (`data/site.db`)",
  TURSO_AUTH_TOKEN: "Token de Turso (acompaña a `TURSO_DATABASE_URL`)",
  NEXT_PUBLIC_SITE_URL: "URL pública (sitemap, canonical, JSON-LD); solo producción",
};

export const STACK = [
  {
    pkg: "next",
    name: "Next.js",
    role: "Framework App Router, Server Actions, ISR, proxy (Turbopack)",
  },
  { pkg: "react", name: "React", role: "UI" },
  { pkg: "typescript", name: "TypeScript", role: "Tipado estricto (compilador nativo)" },
  {
    pkg: "tailwindcss",
    name: "Tailwind CSS",
    role: "Estilos con tema claro/oscuro (variables CSS)",
  },
  {
    pkg: "drizzle-orm",
    name: "Drizzle ORM",
    role: "libSQL tipado + migraciones + semilla automática",
  },
  {
    pkg: "@libsql/client",
    name: "Turso / libSQL",
    role: "SQLite en la nube (producción) o archivo local (desarrollo)",
  },
  { pkg: "@biomejs/biome", name: "Biome", role: "Linter + formatter (un solo binario, sin Babel)" },
  { pkg: "lefthook", name: "lefthook", role: "Hook de pre-commit (docs:check)" },
  { pkg: "vitest", name: "Vitest", role: "Tests unitarios" },
  { pkg: "@playwright/test", name: "Playwright", role: "Tests E2E" },
  { pkg: "zod", name: "Zod", role: "Validación de entradas en server actions" },
  { pkg: "jose", name: "jose", role: "JWT HS256 de sesiones (compatible con proxy runtime)" },
  { pkg: null, name: "scrypt", role: "Hash de contraseñas sin dependencias (Node crypto)" },
];

// Variables legítimas que no van en .env.example: las provee el entorno
// (CI, Vercel, Node) o son ajustes internos de scripts/pruebas/analítica avanzada.
export const ENV_INTERNAL = new Set([
  "CI",
  "NODE_ENV",
  "VERCEL",
  "ANALYTICS_ALLOW_LOCALHOST",
  "ANALYTICS_DISABLED",
  "ANALYTICS_SECRET",
  "CV_BASE_URL",
  "E2E_BASE_URL",
  "PLAYWRIGHT_CHROMIUM_EXECUTABLE",
  "ComSpec",
]);

// ————— Fuentes —————

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".mjs", ".mts"]);
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "data",
  "docs",
  "playwright-report",
  "test-results",
]);

function walkFiles(root, rel, visit) {
  const abs = path.join(root, rel);
  if (!existsSync(abs)) return;
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".env.example") continue;
    const relChild = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkFiles(root, relChild, visit);
    } else {
      visit(relChild);
    }
  }
}

export function readSources(root) {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const envExample = readFileSync(path.join(root, ".env.example"), "utf8");
  const envDeclared = [];
  for (const line of envExample.split(/\r?\n/)) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=/);
    if (match) envDeclared.push(match[1]);
  }
  const envUsage = new Set();
  const envRe = /process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g;
  walkFiles(root, "src", (rel) => collect(rel));
  walkFiles(root, "scripts", (rel) => collect(rel));
  walkFiles(root, "tests", (rel) => collect(rel));
  for (const rel of ["playwright.config.ts", "next.config.ts", "drizzle.config.ts"]) {
    if (existsSync(path.join(root, rel))) collect(rel);
  }
  function collect(rel) {
    const ext = path.extname(rel);
    if (!SOURCE_EXTENSIONS.has(ext)) return;
    const text = readFileSync(path.join(root, rel), "utf8");
    for (const match of text.matchAll(envRe)) envUsage.add(match[1]);
  }
  const routes = [];
  const appRoot = path.join(root, "src", "app");
  if (existsSync(appRoot)) {
    walkFiles(root, "src/app", (rel) => {
      if (!(rel.endsWith("page.tsx") || rel.endsWith("route.ts"))) return;
      const segments = rel
        .split("/")
        .slice(2, -1)
        .filter((seg) => !/^\(.*\)$/.test(seg));
      const url = `/${segments.join("/")}`.replace(/\/$/, "") || "/";
      routes.push({ path: url, kind: rel.endsWith("route.ts") ? "API" : "Página" });
    });
  }
  routes.sort((a, b) => a.path.localeCompare(b.path) || a.kind.localeCompare(b.kind));
  const srcDirs = existsSync(path.join(root, "src"))
    ? readdirSync(path.join(root, "src"), { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()
    : [];
  return {
    pkg,
    scriptNames: Object.keys(pkg.scripts ?? {}),
    envDeclared,
    envUsage: [...envUsage].sort(),
    routes,
    srcDirs,
  };
}

// ————— Renderizadores —————

export function renderCommands(pkg) {
  const problems = [];
  const scripts = Object.keys(pkg.scripts ?? {});
  for (const name of scripts) {
    if (!SCRIPT_DOCS[name]) problems.push(`SCRIPT_DOCS: falta la descripción del script "${name}"`);
  }
  for (const name of Object.keys(SCRIPT_DOCS)) {
    if (!scripts.includes(name))
      problems.push(`SCRIPT_DOCS: "${name}" ya no existe como script en package.json`);
  }
  const rows = scripts
    .filter((name) => SCRIPT_DOCS[name])
    .map((name) => `| \`pnpm ${name}\` | ${SCRIPT_DOCS[name]} |`);
  const content = ["| Comando | Descripción |", "|---|---|", ...rows].join("\n");
  return { content, problems };
}

export function renderEnv(envDeclared) {
  const problems = [];
  for (const name of envDeclared) {
    if (!ENV_DOCS[name]) problems.push(`ENV_DOCS: falta la descripción de la variable "${name}"`);
  }
  const rows = envDeclared
    .filter((name) => ENV_DOCS[name])
    .map((name) => `| \`${name}\` | ${ENV_DOCS[name]} |`);
  const content = ["| Variable | Detalle |", "|---|---|", ...rows].join("\n");
  return { content, problems };
}

export function renderRoutes(routes) {
  const rows = routes.map((r) => `| \`${r.path}\` | ${r.kind} |`);
  return ["| Ruta | Tipo |", "|---|---|", ...rows].join("\n");
}

const cleanVersion = (range) => range.replace(/^[\^~>=<\s]+/, "");

export function renderStack(pkg) {
  const problems = [];
  const all = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  const rows = [];
  for (const entry of STACK) {
    if (entry.pkg === null) {
      rows.push(`| ${entry.name} | — | ${entry.role} |`);
      continue;
    }
    const range = all[entry.pkg];
    if (!range) {
      problems.push(`STACK: "${entry.pkg}" ya no está en package.json (¿tooling cambiado?)`);
      continue;
    }
    rows.push(`| ${entry.name} | ${cleanVersion(range)} | ${entry.role} |`);
  }
  const content = ["| Herramienta | Versión | Rol |", "|---|---|---|", ...rows].join("\n");
  return { content, problems };
}

export function checkEnvCoverage(envDeclared, envUsage) {
  const problems = [];
  for (const name of envUsage) {
    if (!envDeclared.includes(name) && !ENV_INTERNAL.has(name)) {
      problems.push(
        `env: "${name}" se usa en el código pero no está en .env.example (o en ENV_INTERNAL)`,
      );
    }
  }
  for (const name of envDeclared) {
    if (!envUsage.includes(name)) {
      problems.push(`env: "${name}" está en .env.example pero no se usa en el código`);
    }
  }
  return problems;
}

// ————— Verificadores —————

const PNPM_SUBCOMMANDS = new Set([
  "install",
  "add",
  "remove",
  "exec",
  "dlx",
  "import",
  "update",
  "why",
  "audit",
  "link",
  "store",
  "ff",
  "run",
]);

export function checkPnpmRefs(text, scriptNames) {
  const scripts = new Set(scriptNames);
  const problems = [];
  for (const match of text.matchAll(/\bpnpm\s+(?:run\s+)?([\w:@.-]+)/g)) {
    const name = match[1];
    if (PNPM_SUBCOMMANDS.has(name) || scripts.has(name)) continue;
    problems.push(`pnpm: "${name}" no existe como script en package.json`);
  }
  return problems;
}

const PATH_ROOTS = ["src/", "scripts/", "tests/", "docs/", "drizzle/"];

export function checkPaths(text, root) {
  const problems = [];
  for (const match of text.matchAll(/`([^`\n]+)`/g)) {
    let token = match[1].trim();
    if (token.includes(" ")) continue;
    if (!PATH_ROOTS.some((prefix) => token.startsWith(prefix))) continue;
    token = token.replace(/:\d+(?:-\d+)?$/, "").replace(/\/$/, "");
    if (!existsSync(path.join(root, token))) {
      problems.push(`ruta: "${match[1]}" no existe en disco`);
    }
  }
  return problems;
}

export function checkStructure(readmeText, srcDirs) {
  const problems = [];
  const tree = readmeText.match(/## 📁 Estructura[\s\S]*?```([\s\S]*?)```/);
  const block = tree ? tree[1] : "";
  for (const dir of srcDirs) {
    if (!block.includes(`${dir}/`)) {
      problems.push(`estructura: falta "src/${dir}/" en el árbol del README`);
    }
  }
  return problems;
}

// ————— Orquestación —————

const DOCS = [
  { file: "AGENTS.md", blocks: ["commands", "env", "stack"] },
  { file: "README.md", blocks: ["commands", "routes", "stack"] },
  { file: "DEPLOY.md", blocks: ["env"] },
];

const VERIFY_FILES = ["AGENTS.md", "README.md", "DEPLOY.md", ".env.example"];

export function runSync({ root, write }) {
  const sources = readSources(root);
  const commands = renderCommands(sources.pkg);
  const env = renderEnv(sources.envDeclared);
  const stack = renderStack(sources.pkg);
  const content = {
    commands: commands.content,
    env: env.content,
    routes: renderRoutes(sources.routes),
    stack: stack.content,
  };
  const problems = [
    ...commands.problems,
    ...env.problems,
    ...stack.problems,
    ...checkEnvCoverage(sources.envDeclared, sources.envUsage),
  ];
  const changed = [];
  for (const doc of DOCS) {
    const blocks = doc.blocks.map((name) => ({ name, content: content[name] ?? "" }));
    const result = syncFile({ filePath: path.join(root, doc.file), blocks, write });
    problems.push(...result.problems);
    if (result.changed) changed.push(doc.file);
  }
  return { changed, problems };
}

export function runCheck({ root }) {
  const sources = readSources(root);
  const sync = runSync({ root, write: false });
  const problems = [
    ...sync.problems,
    ...sync.changed.map((file) => `${file}: bloque(s) desactualizados — ejecuta "pnpm docs:sync"`),
  ];
  for (const file of VERIFY_FILES) {
    const text = readFileSync(path.join(root, file), "utf8");
    problems.push(...checkPnpmRefs(text, sources.scriptNames));
    problems.push(...checkPaths(text, root));
  }
  problems.push(
    ...checkStructure(readFileSync(path.join(root, "README.md"), "utf8"), sources.srcDirs),
  );
  return problems;
}

export function main(argv = process.argv.slice(2)) {
  const modeName = argv[0];
  if (modeName !== "sync" && modeName !== "check") {
    console.error("uso: node scripts/docs-sync.mjs <sync|check>");
    return 2;
  }
  const root = process.cwd();
  if (modeName === "sync") {
    const { changed, problems } = runSync({ root, write: true });
    console.log(
      changed.length ? `docs-sync: actualizado ${changed.join(", ")}` : "docs-sync: sin cambios",
    );
    for (const problem of problems) console.error(`- ${problem}`);
    return problems.length ? 1 : 0;
  }
  const problems = runCheck({ root });
  if (problems.length === 0) {
    console.log("docs-sync: documentación en orden");
    return 0;
  }
  for (const problem of problems) console.error(`- ${problem}`);
  return 1;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) process.exit(main());
