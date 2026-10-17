/**
 * @file run.mjs
 * @description Motor de evals (spec §4.2 y §4.3).
 *
 * Modos:
 *   run       corrida completa: clon aislado → agente → diff → gates → aceptación → result.json
 *   validate  solo aceptación sobre un clon pristine de la base (debe fallar = rojo confirmado)
 *   baseline  gates de referencia sobre un clon pristine (sin agente)
 *   report    genera evals/reports/<experimento>.md desde evals/results/
 *
 * Reglas del runner:
 *   - trabaja siempre sobre un clon temporal, nunca sobre el repo de trabajo;
 *   - valida rutas antes de copiar (assertInside);
 *   - en Windows mata el árbol de procesos completo al agotar el tiempo;
 *   - registra la línea de comandos efectiva y el entorno (sin secretos);
 *   - el tope de tiempo es del runner (2.1.291 no tiene --max-turns) y el de
 *     costo va en el CLI (--max-budget-usd, solo funciona con --print).
 */

import { spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generarInformes } from "./report.mjs";
import { BaselineSchema, ResultadoSchema, TareaSchema } from "./schema.mjs";

export const TEMP_ROOT = path.join(os.tmpdir(), "pegm-evals");

const CREDENCIALES_PRUEBA = { ADMIN_EMAIL: "admin@pablo.cl", ADMIN_PASSWORD: "admin1234" };
const VARIABLES_SENSIBLES = [
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "AUTH_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "NEXT_PUBLIC_SITE_URL",
];
const TIMEOUT_INSTALL_MS = 15 * 60 * 1000;
const TIMEOUT_GATE_MS = 10 * 60 * 1000;
const MAX_CAPTURA = 256 * 1024;
const TAIL_DETALLE = 2000;

const log = (mensaje) => console.log(`[evals] ${mensaje}`);

const tail = (texto, limite = TAIL_DETALLE) => {
  const limpio = (texto ?? "").trim();
  return limpio.length > limite ? `…${limpio.slice(limpio.length - limite)}` : limpio;
};

/**
 * Verifica que `child` quede dentro de `parent` (resolución absoluta + guarda
 * de prefijo por segmento, para no confundir "eval" con "eval-otro").
 */
export function assertInside(parent, child, etiqueta) {
  const base = path.resolve(parent);
  const destino = path.resolve(child);
  if (destino !== base && !destino.startsWith(base + path.sep)) {
    throw new Error(`${etiqueta}: "${destino}" queda fuera de "${base}"`);
  }
  return destino;
}

/**
 * Entorno saneado para todos los procesos de la corrida: nunca variables de
 * Turso/administrador reales; credenciales de prueba y AUTH_SECRET efímero.
 */
export function sanitizeEnv(base, secreto = crypto.randomBytes(32).toString("hex")) {
  const env = { ...base };
  for (const nombre of VARIABLES_SENSIBLES) delete env[nombre];
  env.AUTH_SECRET = secreto;
  env.ADMIN_EMAIL = CREDENCIALES_PRUEBA.ADMIN_EMAIL;
  env.ADMIN_PASSWORD = CREDENCIALES_PRUEBA.ADMIN_PASSWORD;
  return env;
}

/** Evidencia del entorno sin secretos (spec §4.2). */
export function resumenEntorno() {
  return {
    AUTH_SECRET: "<efímero por corrida>",
    ADMIN_EMAIL: CREDENCIALES_PRUEBA.ADMIN_EMAIL,
    ADMIN_PASSWORD: "<oculta> (credencial de prueba)",
    TURSO_DATABASE_URL: "<ausente a propósito>",
    TURSO_AUTH_TOKEN: "<ausente a propósito>",
  };
}

/**
 * Construye la línea de comandos del agente: banderas operativas del runner
 * (--print, JSON, modelo, presupuesto, sesión) + banderas de la tarea.
 */
export function buildAgentCommand({ task, sessionId, resume = null, usdRestante = null }) {
  const tool = validarToken(task.agente.tool, "agente.tool");
  const model = validarToken(task.agente.model, "agente.model");
  for (const flag of task.agente.flags) validarToken(flag, "agente.flags");
  if (resume) validarToken(resume, "--resume");
  const usd = usdRestante ?? task.presupuesto.usd;
  const args = [
    "--print",
    "--output-format",
    "json",
    "--model",
    model,
    "--max-budget-usd",
    String(usd),
  ];
  if (resume) args.push("--resume", resume);
  else args.push("--session-id", sessionId);
  args.push(...task.agente.flags);
  return { tool, args };
}

/**
 * Interpreta stdout de `claude --print --output-format json`. Si hay líneas
 * previas (avisos), busca el último bloque JSON válido. Campos ausentes → null.
 */
export function parseClaudeOutput(stdout) {
  const vacio = {
    json: null,
    sessionId: null,
    tokensEntrada: null,
    tokensSalida: null,
    costoUsd: null,
    detenidoPor: null,
    completion: false,
  };
  const texto = typeof stdout === "string" ? stdout.trim() : "";
  if (!texto) return vacio;
  let json = null;
  try {
    json = JSON.parse(texto);
  } catch {
    // La salida puede traer líneas previas; probar desde cada "{" hacia abajo.
    const lineas = texto.split(/\r?\n/);
    for (let i = lineas.length - 1; i >= 0 && json === null; i--) {
      if (!lineas[i].trimStart().startsWith("{")) continue;
      try {
        json = JSON.parse(lineas.slice(i).join("\n"));
      } catch {
        json = null;
      }
    }
  }
  if (!json || typeof json !== "object" || Array.isArray(json)) return vacio;
  const usage = typeof json.usage === "object" && json.usage !== null ? json.usage : {};
  const detenidoPor =
    json.subtype === "error_max_budget_usd" ? "presupuesto" : json.is_error ? "error" : null;
  return {
    json,
    sessionId: typeof json.session_id === "string" ? json.session_id : null,
    tokensEntrada: Number.isInteger(usage.input_tokens) ? usage.input_tokens : null,
    tokensSalida: Number.isInteger(usage.output_tokens) ? usage.output_tokens : null,
    costoUsd: typeof json.total_cost_usd === "number" ? json.total_cost_usd : null,
    detenidoPor,
    completion: json.subtype === "success",
  };
}

/** Totales de `git diff --cached --numstat` (líneas binarias cuentan 0). */
export function parseNumstat(texto) {
  let archivos = 0;
  let inserciones = 0;
  let eliminaciones = 0;
  for (const linea of (texto ?? "").split(/\r?\n/)) {
    if (!linea.trim()) continue;
    const [a, b] = linea.split("\t");
    const numero = (valor) => (/^\d+$/.test(valor) ? Number(valor) : 0);
    archivos += 1;
    inserciones += numero(a);
    eliminaciones += numero(b);
  }
  return { archivos, inserciones, eliminaciones };
}

/** Nivel de la corrida según spec §3 (A–D). `C` solo con intervención humana. */
export function computeLevel({ aceptacionPass, gates, reanudaciones, intervenciones }) {
  const gatesOk = gates.every((gate) => gate.resultado !== "fail");
  if (!aceptacionPass || !gatesOk) return "D";
  if (intervenciones.length > 0) return "C";
  return reanudaciones >= 1 ? "B" : "A";
}

/**
 * Estado explícito de la corrida. Precedencia (de mayor a menor jerarquía
 * operativa): infraestructura → timeout → presupuesto → incomplete →
 * not_executed → failed → passed. Distingue el fallo real del ruido operativo;
 * el `nivel` A–D no cambia (spec §3).
 */
export function computeEstado({ corrida, salida, gates, aceptacion }) {
  const motivosFallidos = [
    ...gates.filter((gate) => gate.resultado !== "pass").map((gate) => gate.motivo),
    ...aceptacion.comandos
      .filter((comando) => comando.exit_code !== 0)
      .map((comando) => comando.motivo),
  ];
  const hayInfra = motivosFallidos.some((motivo) => motivo === "spawn" || motivo === "signal");
  if (corrida.error || hayInfra) return "infrastructure_error";
  if (corrida.timedOut || motivosFallidos.includes("timeout")) return "timeout";
  if (salida.detenidoPor === "presupuesto") return "budget_exceeded";
  if (!salida.completion) return "incomplete";
  if (gates.length === 0 || aceptacion.comandos.length === 0) return "not_executed";
  if (gates.some((gate) => gate.resultado !== "pass") || !aceptacion.pass) return "failed";
  return "passed";
}

function matarArbol(child) {
  if (!child.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      windowsHide: true,
      stdio: "ignore",
    });
    return;
  }
  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    try {
      child.kill("SIGKILL");
    } catch {
      // El proceso ya terminó.
    }
  }
}

function runChild({
  comando,
  args = [],
  shell = false,
  cwd,
  env,
  timeoutMs = null,
  entrada = null,
}) {
  return new Promise((resolve) => {
    const inicio = Date.now();
    let child;
    try {
      child = spawn(comando, args, {
        cwd,
        env,
        shell,
        stdio: [entrada === null ? "ignore" : "pipe", "pipe", "pipe"],
        windowsHide: true,
        detached: process.platform !== "win32",
      });
    } catch (error) {
      resolve({
        exitCode: null,
        timedOut: false,
        error: error.message,
        stdout: "",
        stderr: "",
        duracionMs: 0,
      });
      return;
    }
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const acumular = (previo, trozo) => {
      const texto = previo + trozo;
      return texto.length > MAX_CAPTURA ? texto.slice(texto.length - MAX_CAPTURA) : texto;
    };
    child.stdout?.on("data", (trozo) => {
      stdout = acumular(stdout, String(trozo));
    });
    child.stderr?.on("data", (trozo) => {
      stderr = acumular(stderr, String(trozo));
    });
    const temporizador = timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          matarArbol(child);
        }, timeoutMs)
      : null;
    if (entrada !== null && child.stdin) {
      child.stdin.on("error", () => {});
      child.stdin.write(entrada);
      child.stdin.end();
    }
    const finalizar = (extra) => {
      if (temporizador) clearTimeout(temporizador);
      resolve({
        exitCode: null,
        timedOut,
        error: null,
        stdout,
        stderr,
        duracionMs: Date.now() - inicio,
        ...extra,
      });
    };
    child.on("error", (error) => finalizar({ error: error.message }));
    child.on("close", (code, signal) => finalizar({ exitCode: code, signal }));
  });
}

const ejecutarExe = (comando, args, opciones) =>
  runChild({ comando, args, shell: false, ...opciones });

const git = (clon, args, entorno) =>
  ejecutarExe("git", args, { cwd: clon, env: entorno, timeoutMs: 5 * 60 * 1000 });

const EJECUTABLES_PERMITIDOS = new Set(["pnpm", "node"]);
const TOKEN_PERMITIDO = /^[A-Za-z0-9@._:/=-]+$/;

/**
 * Valida un token de línea de comandos: sin metacaracteres de shell, sin rutas
 * absolutas y sin traversal. Fail-closed: un token fuera de dominio aborta la
 * corrida en lugar de ejecutarse.
 */
export function validarToken(token, contexto = "token") {
  if (typeof token !== "string" || token.length === 0) {
    throw new Error(`${contexto}: token vacío o no textual`);
  }
  if (!TOKEN_PERMITIDO.test(token)) {
    throw new Error(`${contexto}: token no permitido "${token}" (solo letras, dígitos y @._:/-=)`);
  }
  if (token.startsWith("/") || /^[A-Za-z]:/.test(token) || token.split("/").includes("..")) {
    throw new Error(`${contexto}: ruta absoluta o traversal no permitida "${token}"`);
  }
  return token;
}

/** "pnpm test:e2e" → { exe, args } con allowlist de ejecutable y tokens válidos. */
export function parseComando(comando) {
  const tokens = String(comando).trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) throw new Error("comando vacío");
  const [exe, ...args] = tokens;
  if (!EJECUTABLES_PERMITIDOS.has(exe)) {
    throw new Error(`ejecutable no permitido "${exe}" en "${comando}" (permitidos: pnpm, node)`);
  }
  for (const token of tokens) validarToken(token, `comando "${comando}"`);
  return { exe, args };
}

/**
 * Lanzamiento sin shell. En Windows los .cmd (pnpm, claude) no son ejecutables
 * directos (spawn sin shell → EINVAL), así que se envuelven en ComSpec con
 * /d /s /c, que preserva stdin/stdout (verificado con pnpm y node).
 */
export function construirLanzamiento(
  exe,
  args = [],
  plataforma = process.platform,
  comspec = process.env.ComSpec,
) {
  if (plataforma === "win32") {
    return { comando: comspec || "cmd.exe", args: ["/d", "/s", "/c", exe, ...args] };
  }
  return { comando: exe, args };
}

const PASO_OK = (nombre, corrida) => {
  if (corrida.error || corrida.timedOut || corrida.exitCode !== 0) {
    const causa = corrida.error ?? (corrida.timedOut ? "timeout" : `exit ${corrida.exitCode}`);
    throw new Error(`${nombre} falló (${causa}): ${tail(corrida.stderr || corrida.stdout)}`);
  }
};

export function parseFlags(argv) {
  const flags = { intervenciones: [], incidencias: [] };
  for (let i = 0; i < argv.length; i++) {
    const actual = argv[i];
    const siguiente = () => {
      i += 1;
      if (i >= argv.length) throw new Error(`falta el valor de ${actual}`);
      return argv[i];
    };
    switch (actual) {
      case "--task":
        flags.task = siguiente();
        break;
      case "--experimento":
        flags.experimento = siguiente();
        break;
      case "--run":
        flags.run = Number(siguiente());
        break;
      case "--resume":
        flags.resume = siguiente();
        break;
      case "--usd-restante":
        flags.usdRestante = Number(siguiente());
        break;
      case "--reanudaciones":
        flags.reanudaciones = Number(siguiente());
        break;
      case "--incidencia":
        flags.incidencias.push(siguiente());
        break;
      case "--intervencion": {
        const valor = siguiente();
        const separador = valor.indexOf(":");
        flags.intervenciones.push({
          tipo: separador === -1 ? valor : valor.slice(0, separador),
          minuto: null,
          nota: separador === -1 ? "" : valor.slice(separador + 1).trim(),
        });
        break;
      }
      case "--repo":
        flags.repo = siguiente();
        break;
      default:
        throw new Error(`bandera desconocida: ${actual}`);
    }
  }
  return flags;
}

export function resolverRaiz(repoFlag) {
  const raiz = path.resolve(repoFlag ?? process.cwd());
  if (!fs.existsSync(path.join(raiz, ".git"))) {
    throw new Error(`no es un repositorio git (falta .git): ${raiz}`);
  }
  if (!fs.existsSync(path.join(raiz, "package.json"))) {
    throw new Error(`no parece el repositorio del sitio (falta package.json): ${raiz}`);
  }
  return raiz;
}

export function cargarTarea(raiz, taskId) {
  if (!taskId) throw new Error("falta --task <id>");
  const tareaDir = path.join(raiz, "evals", "tasks", taskId);
  const archivo = path.join(tareaDir, "task.json");
  if (!fs.existsSync(archivo)) throw new Error(`no existe la tarea: ${archivo}`);
  const tarea = TareaSchema.parse(JSON.parse(fs.readFileSync(archivo, "utf8")));
  if (tarea.id !== taskId) {
    throw new Error(`task.json declara id "${tarea.id}" pero se solicitó "${taskId}"`);
  }
  validarToken(tarea.agente.tool, "task.json agente.tool");
  validarToken(tarea.agente.model, "task.json agente.model");
  for (const flag of tarea.agente.flags) validarToken(flag, "task.json agente.flags");
  for (const comando of tarea.gates) parseComando(comando);
  for (const comando of tarea.aceptacion.comandos) parseComando(comando);
  return { tarea, tareaDir };
}

async function prepararClon({ raiz, destino, baseCommit, entorno }) {
  assertInside(TEMP_ROOT, destino, "clon");
  if (fs.existsSync(destino) && fs.readdirSync(destino).length > 0) {
    throw new Error(`el clon ya existe (otra corrida en curso): ${destino}`);
  }
  fs.mkdirSync(destino, { recursive: true });
  log(`clonando (git clone --shared) en ${destino}`);
  PASO_OK(
    "git clone",
    await ejecutarExe("git", ["clone", "--shared", "--quiet", raiz, destino], {
      cwd: TEMP_ROOT,
      env: entorno,
      timeoutMs: 5 * 60 * 1000,
    }),
  );
  PASO_OK("git checkout", await git(destino, ["checkout", "--quiet", baseCommit], entorno));
  const verificar = await git(destino, ["rev-parse", "HEAD"], entorno);
  PASO_OK("git rev-parse", verificar);
  if (verificar.stdout.trim() !== baseCommit) {
    throw new Error(`el clon no quedó en ${baseCommit} sino en ${verificar.stdout.trim()}`);
  }
  PASO_OK("git remote remove", await git(destino, ["remote", "remove", "origin"], entorno));
  PASO_OK("git config", await git(destino, ["config", "user.name", "Evals PEGM"], entorno));
  PASO_OK("git config", await git(destino, ["config", "user.email", "evals@localhost"], entorno));
}

async function prepararClonCompleto({ raiz, destino, baseCommit, entorno }) {
  await prepararClon({ raiz, destino, baseCommit, entorno });
  fs.writeFileSync(
    path.join(destino, ".env"),
    [
      `AUTH_SECRET="${entorno.AUTH_SECRET}"`,
      `ADMIN_EMAIL="${entorno.ADMIN_EMAIL}"`,
      `ADMIN_PASSWORD="${entorno.ADMIN_PASSWORD}"`,
      "",
    ].join("\n"),
    "utf8",
  );
  log("instalando dependencias (pnpm install --frozen-lockfile)…");
  const instalacion = parseComando("pnpm install --frozen-lockfile");
  PASO_OK(
    "pnpm install",
    await runChild({
      ...construirLanzamiento(instalacion.exe, instalacion.args),
      cwd: destino,
      env: entorno,
      timeoutMs: TIMEOUT_INSTALL_MS,
    }),
  );
}

async function capturarDiff(clon, entorno) {
  PASO_OK("git add", await git(clon, ["add", "-A"], entorno));
  const numstat = await git(clon, ["diff", "--cached", "--numstat"], entorno);
  PASO_OK("git diff --numstat", numstat);
  const parche = await git(clon, ["diff", "--cached", "--no-color"], entorno);
  PASO_OK("git diff", parche);
  return { ...parseNumstat(numstat.stdout), parche: parche.stdout };
}

async function correrComandos({ comandos, cwd, env, timeoutMs, salidaMax = TAIL_DETALLE }) {
  const resultados = [];
  for (const comando of comandos) {
    log(`ejecutando: ${comando}`);
    const { exe, args } = parseComando(comando);
    const corrida = await runChild({ ...construirLanzamiento(exe, args), cwd, env, timeoutMs });
    const duracion = corrida.duracionMs / 1000;
    const motivo = corrida.error
      ? "spawn"
      : corrida.timedOut
        ? "timeout"
        : corrida.signal
          ? "signal"
          : "exit";
    if (corrida.error) {
      resultados.push({
        comando,
        resultado: "fail",
        exit_code: null,
        duracion_s: duracion,
        motivo,
        detalle: `no se pudo ejecutar: ${corrida.error}`,
      });
      continue;
    }
    const resultado = corrida.timedOut ? "fail" : corrida.exitCode === 0 ? "pass" : "fail";
    const detalle = corrida.timedOut
      ? tail(
          `timeout tras ${Math.round(duracion)} s\n${corrida.stderr || corrida.stdout}`,
          salidaMax,
        )
      : resultado === "pass"
        ? tail(corrida.stdout, 400)
        : tail(corrida.stderr || corrida.stdout, salidaMax);
    resultados.push({
      comando,
      resultado,
      exit_code: corrida.exitCode,
      duracion_s: duracion,
      motivo,
      detalle,
    });
    log(`  → ${resultado} (${duracion.toFixed(1)} s)`);
  }
  return resultados;
}

/**
 * Copia los archivos de aceptación al clon (después del agente y de los gates).
 * Origen y destino se validan contra la carpeta de la tarea y el clon.
 */
export function inyectarAceptacion({ tareaDir, clonDir, archivos }) {
  const inyectados = [];
  for (const relativo of archivos) {
    if (path.isAbsolute(relativo)) {
      throw new Error(`ruta absoluta no permitida en aceptación: ${relativo}`);
    }
    const origen = assertInside(tareaDir, path.resolve(tareaDir, relativo), "aceptación origen");
    if (!fs.existsSync(origen)) throw new Error(`no existe el archivo de aceptación: ${origen}`);
    const destino = assertInside(clonDir, path.resolve(clonDir, relativo), "aceptación destino");
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.copyFileSync(origen, destino);
    inyectados.push(relativo);
  }
  return inyectados;
}

async function ejecutarAceptacion({ tarea, tareaDir, clon, entorno }) {
  const inyectados = inyectarAceptacion({
    tareaDir,
    clonDir: clon,
    archivos: tarea.aceptacion.archivos,
  });
  log(`aceptación inyectada en el clon: ${inyectados.join(", ")}`);
  const timeoutMs = (tarea.aceptacion.timeout_min ?? 8) * 60 * 1000;
  const comandos = await correrComandos({
    comandos: tarea.aceptacion.comandos,
    cwd: clon,
    env: entorno,
    timeoutMs,
    salidaMax: 4000,
  });
  const pass = comandos.length > 0 && comandos.every((comando) => comando.resultado === "pass");
  const fallidos = comandos.filter((comando) => comando.resultado !== "pass");
  const detalle = pass
    ? "todos los comandos de la aceptación terminaron en 0"
    : `fallaron ${fallidos.length}/${comandos.length}: ${fallidos.map((c) => c.comando).join("; ")}`;
  return {
    pass,
    detalle,
    comandos: comandos.map(({ comando, exit_code, duracion_s, motivo, detalle: salida_tail }) => ({
      comando,
      exit_code,
      duracion_s,
      motivo,
      salida_tail,
    })),
  };
}

async function versionDelCli(tool, entorno) {
  const lanzamiento = construirLanzamiento(validarToken(tool, "agente.tool"), ["--version"]);
  const corrida = await runChild({
    ...lanzamiento,
    cwd: TEMP_ROOT,
    env: entorno,
    timeoutMs: 60 * 1000,
  });
  if (corrida.error || corrida.exitCode !== 0) return null;
  return corrida.stdout.trim().split(/\r?\n/)[0] || null;
}

async function modoRun(flags) {
  const raiz = resolverRaiz(flags.repo);
  const { tarea, tareaDir } = cargarTarea(raiz, flags.task);
  const experimento = flags.experimento ?? tarea.id;
  if (!Number.isInteger(flags.run) || flags.run < 1)
    throw new Error("falta --run <n> (entero ≥ 1)");
  const prompt = fs.readFileSync(path.join(tareaDir, "prompt.md"), "utf8");

  const entorno = sanitizeEnv(process.env);
  const clon = assertInside(
    TEMP_ROOT,
    path.join(TEMP_ROOT, experimento, `run-${flags.run}`),
    "clon",
  );
  const existe = fs.existsSync(clon) && fs.readdirSync(clon).length > 0;
  if (existe && !flags.resume) {
    throw new Error(
      `el clon ya existe; para continuar la misma corrida usa --resume <session-id>: ${clon}`,
    );
  }
  if (!existe) {
    await prepararClonCompleto({ raiz, destino: clon, baseCommit: tarea.base_commit, entorno });
  } else {
    log(`reutilizando clon para reanudación neutral: ${clon}`);
  }

  const version = await versionDelCli(tarea.agente.tool, entorno);
  const sessionId = crypto.randomUUID();
  const { tool, args } = buildAgentCommand({
    task: tarea,
    sessionId,
    resume: flags.resume,
    usdRestante: flags.usdRestante,
  });
  const comandoEfectivo = [tool, ...args].join(" ");
  log(`agente (${version ?? "versión desconocida"}): ${comandoEfectivo}`);
  const inicio = new Date().toISOString();
  const t0 = Date.now();
  const corrida = await runChild({
    ...construirLanzamiento(tool, args),
    cwd: clon,
    env: entorno,
    timeoutMs: tarea.presupuesto.minutos * 60 * 1000,
    entrada: prompt,
  });
  if (corrida.error && /ENOENT/.test(corrida.error)) {
    throw new Error(`no se encontró el CLI "${tool}" en PATH (${corrida.error})`);
  }
  const duracionMin = (Date.now() - t0) / 60000;
  const salida = parseClaudeOutput(corrida.stdout);
  const detenidoPor = corrida.timedOut ? "tiempo" : corrida.error ? "error" : salida.detenidoPor;
  log(
    `agente terminado: exit=${corrida.exitCode ?? "—"} · detenido_por=${detenidoPor ?? "—"} · costo=${salida.costoUsd ?? "—"} USD`,
  );

  const diff = await capturarDiff(clon, entorno);
  log(`diff: ${diff.archivos} archivos, +${diff.inserciones}/−${diff.eliminaciones}`);
  const gates = await correrComandos({
    comandos: tarea.gates,
    cwd: clon,
    env: entorno,
    timeoutMs: TIMEOUT_GATE_MS,
  });
  const aceptacion = await ejecutarAceptacion({ tarea, tareaDir, clon, entorno });
  const reanudaciones = flags.reanudaciones ?? (flags.resume ? 1 : 0);
  const nivel = computeLevel({
    aceptacionPass: aceptacion.pass,
    gates,
    reanudaciones,
    intervenciones: flags.intervenciones,
  });
  const estado = computeEstado({ corrida, salida, gates, aceptacion });

  const resultado = {
    experimento,
    run: flags.run,
    task_id: tarea.id,
    base_commit: tarea.base_commit,
    agente: { tool, version, model: tarea.agente.model, flags: tarea.agente.flags },
    inicio,
    fin: new Date().toISOString(),
    duracion_min: Number(duracionMin.toFixed(2)),
    presupuesto: tarea.presupuesto,
    clon,
    comando_efectivo: comandoEfectivo,
    entorno_resumen: resumenEntorno(),
    agente_resultado: {
      exit_code: corrida.exitCode,
      tokens_entrada: salida.tokensEntrada,
      tokens_salida: salida.tokensSalida,
      costo_usd: salida.costoUsd,
      detenido_por: detenidoPor,
      completion: salida.completion && !corrida.timedOut && !corrida.error,
      session_json: salida.json,
    },
    gates,
    aceptacion,
    diff,
    intervenciones: flags.intervenciones,
    incidencias_plataforma: flags.incidencias,
    reanudaciones,
    nivel,
    estado,
    notas:
      salida.json === null && corrida.stdout.trim() !== ""
        ? "la salida del CLI no pudo interpretarse como JSON; el clon queda como evidencia"
        : "",
  };
  ResultadoSchema.parse(resultado);

  const destino = assertInside(
    path.join(raiz, "evals", "results"),
    path.join(raiz, "evals", "results", experimento, `run-${flags.run}`, "result.json"),
    "resultado",
  );
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, `${JSON.stringify(resultado, null, 2)}\n`, "utf8");
  log(
    `run-${flags.run} listo: estado ${estado} · nivel ${nivel} · aceptación ${aceptacion.pass ? "verde" : "roja"} · gates ${gates.filter((g) => g.resultado === "pass").length}/${gates.length}`,
  );
  log(`resultado: ${destino}`);
  log(`clon (evidencia): ${clon}`);
  return 0;
}

async function modoValidar(flags) {
  const raiz = resolverRaiz(flags.repo);
  const { tarea, tareaDir } = cargarTarea(raiz, flags.task);
  const entorno = sanitizeEnv(process.env);
  const clon = assertInside(TEMP_ROOT, path.join(TEMP_ROOT, tarea.id, "validate"), "clon");
  if (fs.existsSync(clon) && fs.readdirSync(clon).length > 0) {
    throw new Error(`el clon de validación ya existe; elimínalo para repetir: ${clon}`);
  }
  await prepararClonCompleto({ raiz, destino: clon, baseCommit: tarea.base_commit, entorno });
  const aceptacion = await ejecutarAceptacion({ tarea, tareaDir, clon, entorno });
  log(`clon de validación (evidencia): ${clon}`);
  if (aceptacion.pass) {
    console.error(
      "[evals] ROJO NO CONFIRMADO: la aceptación pasó en la base pristine; la tarea no discrimina",
    );
    return 1;
  }
  console.log("[evals] ROJO CONFIRMADO: la aceptación falla en la base pristine");
  return 0;
}

async function modoBaseline(flags) {
  const raiz = resolverRaiz(flags.repo);
  const { tarea } = cargarTarea(raiz, flags.task);
  const experimento = flags.experimento ?? tarea.id;
  const entorno = sanitizeEnv(process.env);
  const clon = assertInside(TEMP_ROOT, path.join(TEMP_ROOT, experimento, "baseline"), "clon");
  const inicio = new Date().toISOString();
  await prepararClonCompleto({ raiz, destino: clon, baseCommit: tarea.base_commit, entorno });
  const gates = await correrComandos({
    comandos: tarea.gates,
    cwd: clon,
    env: entorno,
    timeoutMs: TIMEOUT_GATE_MS,
  });
  const baseline = {
    experimento,
    base_commit: tarea.base_commit,
    inicio,
    fin: new Date().toISOString(),
    gates,
    notas: "",
  };
  BaselineSchema.parse(baseline);
  const destino = assertInside(
    path.join(raiz, "evals", "results"),
    path.join(raiz, "evals", "results", experimento, "baseline.json"),
    "baseline",
  );
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  log(`baseline listo: ${destino}`);
  log(`clon (evidencia): ${clon}`);
  return 0;
}

function modoReport(flags) {
  const raiz = resolverRaiz(flags.repo);
  const escritos = generarInformes({ root: raiz, experimento: flags.experimento });
  if (escritos.length === 0) {
    console.error("[evals] no hay resultados que informar en evals/results/");
    return 1;
  }
  for (const archivo of escritos) log(`informe: ${archivo}`);
  return 0;
}

const USO = `uso: node scripts/evals/run.mjs <run|validate|baseline|report> [opciones]

  run        corrida completa: clon aislado → agente → diff → gates → aceptación → result.json
  validate   solo aceptación sobre un clon pristine de la base (debe fallar = rojo)
  baseline   gates de referencia sobre un clon pristine (sin agente)
  report     genera evals/reports/<experimento>.md desde evals/results/

opciones:
  --task <id>                 tarea en evals/tasks/<id> (run, validate, baseline)
  --experimento <nombre>      carpeta de resultados (por defecto: id de la tarea)
  --run <n>                   número de corrida ≥ 1 (run)
  --resume <session-id>       reanudación neutral de una corrida en curso (run)
  --usd-restante <monto>      presupuesto restante para la reanudación (run)
  --reanudaciones <n>         reanudaciones neutras usadas (run)
  --intervencion "tipo:nota"  intervención humana correctiva (repetible; run)
  --incidencia "nota"         incidencia de plataforma (repetible; run)
  --repo <ruta>               raíz del repositorio (por defecto: cwd)
`;

export async function main(argv = process.argv.slice(2)) {
  const [modo, ...resto] = argv;
  if (!modo || modo === "--help" || modo === "-h") {
    console.log(USO);
    return modo ? 0 : 2;
  }
  fs.mkdirSync(TEMP_ROOT, { recursive: true });
  const flags = parseFlags(resto);
  switch (modo) {
    case "run":
      return modoRun(flags);
    case "validate":
      return modoValidar(flags);
    case "baseline":
      return modoBaseline(flags);
    case "report":
      return modoReport(flags);
    default:
      console.error(`[evals] modo desconocido: ${modo}\n`);
      console.error(USO);
      return 2;
  }
}

const esPrincipal =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (esPrincipal) {
  main()
    .then((codigo) => {
      process.exitCode = codigo;
    })
    .catch((error) => {
      console.error(`[evals] error: ${error.message}`);
      process.exitCode = 1;
    });
}
