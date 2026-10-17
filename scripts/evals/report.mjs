/**
 * @file report.mjs
 * @description Generación de informes (spec §4.6): agrega `evals/results/` en un
 * informe Markdown por experimento (tabla por corrida, baseline, narrativa,
 * comparación y limitaciones). Función pura `buildInforme` + escritura
 * `generarInformes` para poder testear la salida sin tocar el disco.
 */

import fs from "node:fs";
import path from "node:path";
import { BaselineSchema, ResultadoSchema } from "./schema.mjs";

const SIN_DATO = "—";

/** Número con decimales fijos o "—" si falta. */
export function fmtNum(valor, decimales = 1) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) return SIN_DATO;
  return valor.toFixed(decimales);
}

/** Monto en USD con máximo 4 decimales (mínimo 2) o "—" si falta. */
export function fmtUsd(valor) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) return SIN_DATO;
  const fijo = valor.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  const [entero, decimales = ""] = fijo.split(".");
  return `$${entero}.${decimales.padEnd(2, "0")}`;
}

/** "n/total" gates verdes, o "—" sin datos. */
export function resumenGates(gates) {
  if (!Array.isArray(gates) || gates.length === 0) return SIN_DATO;
  const pass = gates.filter((gate) => gate.resultado === "pass").length;
  return `${pass}/${gates.length}`;
}

const rango = (valores, formateador = (valor) => fmtNum(valor)) => {
  const numeros = valores.filter((valor) => typeof valor === "number" && Number.isFinite(valor));
  if (numeros.length === 0) return SIN_DATO;
  const minimo = Math.min(...numeros);
  const maximo = Math.max(...numeros);
  return minimo === maximo
    ? formateador(minimo)
    : `${formateador(minimo)} – ${formateador(maximo)}`;
};

const contar = (valores, valor) => valores.filter((item) => item === valor).length;

function tablaCorridas(corridas) {
  const encabezado = [
    "| corrida | aceptación | gates | nivel | duración (min) | tokens (ent/sal) | costo (USD) | diff |",
    "|---|---|---|---|---|---|---|---|",
  ];
  const filas = corridas.map((corrida) => {
    const agente = corrida.agente_resultado;
    const tokens = `${agente.tokens_entrada ?? SIN_DATO} / ${agente.tokens_salida ?? SIN_DATO}`;
    const diff = `+${corrida.diff.inserciones}/−${corrida.diff.eliminaciones} (${corrida.diff.archivos} arch.)`;
    return `| run-${corrida.run} | ${corrida.aceptacion.pass ? "pass" : "fail"} | ${resumenGates(corrida.gates)} | ${corrida.nivel} | ${fmtNum(corrida.duracion_min)} | ${tokens} | ${fmtUsd(agente.costo_usd)} | ${diff} |`;
  });
  return [...encabezado, ...filas];
}

function tablaBaseline(baseline) {
  const encabezado = ["| gate | resultado | duración (s) |", "|---|---|---|"];
  const filas = baseline.gates.map(
    (gate) => `| \`${gate.comando}\` | ${gate.resultado} | ${fmtNum(gate.duracion_s)} |`,
  );
  return [...encabezado, ...filas];
}

function seccionNarrativa(corridas) {
  const niveles = corridas.map((corrida) => corrida.nivel);
  const lineas = [
    `- Niveles: ${["A", "B", "C", "D"].map((nivel) => `${nivel}: ${contar(niveles, nivel)}`).join(" · ")}.`,
    `- Aceptación: ${contar(
      corridas.map((corrida) => corrida.aceptacion.pass),
      true,
    )} de ${corridas.length} corridas en verde.`,
  ];
  const todosGates = corridas.filter((corrida) =>
    corrida.gates.every((gate) => gate.resultado === "pass"),
  );
  lineas.push(
    `- Gates completos (todos verdes): ${todosGates.length} de ${corridas.length} corridas.`,
  );
  const reanudaciones = corridas.reduce((total, corrida) => total + corrida.reanudaciones, 0);
  const intervenciones = corridas.reduce(
    (total, corrida) => total + corrida.intervenciones.length,
    0,
  );
  const incidencias = corridas.flatMap((corrida) =>
    corrida.incidencias_plataforma.map((incidencia) => `run-${corrida.run}: ${incidencia}`),
  );
  lineas.push(
    `- Reanudaciones neutrales: ${reanudaciones} · intervenciones humanas: ${intervenciones}.`,
  );
  const anomalas = corridas.filter(
    (corrida) => corrida.agente_resultado.detenido_por !== null || corrida.nivel === "D",
  );
  if (anomalas.length > 0) {
    lineas.push(
      `- Corridas con detención o nivel D: ${anomalas.map((corrida) => `run-${corrida.run}`).join(", ")}.`,
    );
  }
  for (const corrida of corridas) {
    if (corrida.notas.trim()) lineas.push(`- Nota run-${corrida.run}: ${corrida.notas.trim()}`);
  }
  for (const incidencia of incidencias) lineas.push(`- Incidencia de plataforma ${incidencia}`);
  return lineas;
}

function seccionComparacion(corridas) {
  const agente = corridas.map((corrida) => corrida.agente_resultado);
  return [
    `- Duración: ${rango(corridas.map((corrida) => corrida.duracion_min))} min.`,
    `- Costo: ${rango(
      agente.map((item) => item.costo_usd),
      fmtUsd,
    )}.`,
    `- Tokens de entrada: ${rango(
      agente.map((item) => item.tokens_entrada),
      (v) => String(v),
    )}.`,
    `- Tokens de salida: ${rango(
      agente.map((item) => item.tokens_salida),
      (v) => String(v),
    )}.`,
    `- Diff: +${rango(
      corridas.map((corrida) => corrida.diff.inserciones),
      (v) => String(v),
    )}/−${rango(
      corridas.map((corrida) => corrida.diff.eliminaciones),
      (v) => String(v),
    )} líneas.`,
  ];
}

const LIMITACIONES = [
  "Evidencia ilustrativa del escenario: pocas corridas no establecen un nivel general del agente ni del proveedor.",
  "El comportamiento depende de las versiones de CLI y modelo registradas; cambios de plataforma pueden alterarlo sin aviso.",
  "El costo proviene de la salida del CLI y puede diferir de la facturación real.",
  "La aceptación se inyecta después de la corrida y solo está garantizada como oculta cuando la base no contiene sus archivos (verificar por tarea).",
  "Un nivel A/B/D combina aceptación y gates sobre el repo resultante; no mide calidad general del código producido.",
  "En corridas reanudadas el diff es acumulativo (incluye el trabajo previo del mismo clon).",
];

/** Informe completo en Markdown; pura: no toca el disco. */
export function buildInforme({ experimento, baseline = null, corridas = [] }) {
  const primera = corridas[0] ?? null;
  const tarea = primera?.task_id ?? SIN_DATO;
  const base = baseline?.base_commit ?? primera?.base_commit ?? SIN_DATO;
  const version = primera?.agente.version ?? SIN_DATO;
  const lineas = [
    `# Informe del experimento \`${experimento}\``,
    "",
    `- Tarea: ${tarea}`,
    `- Base: \`${base}\``,
    `- Agente: \`${primera?.agente.tool ?? SIN_DATO}\` ${version} · modelo \`${primera?.agente.model ?? SIN_DATO}\``,
    `- Corridas registradas: ${corridas.length}`,
    baseline
      ? `- Baseline sobre la base pristine: gates ${resumenGates(baseline.gates)}`
      : "- Baseline: sin registrar",
    "",
    "## Resultados por corrida",
    "",
    ...(corridas.length > 0 ? tablaCorridas(corridas) : ["Sin corridas registradas todavía."]),
    "",
    "## Baseline (sin agente)",
    "",
    ...(baseline ? tablaBaseline(baseline) : ["Sin baseline registrado."]),
    "",
    "## Narrativa",
    "",
    ...(corridas.length > 0 ? seccionNarrativa(corridas) : ["—"]),
    "",
    "## Comparación entre corridas",
    "",
    ...(corridas.length > 0 ? seccionComparacion(corridas) : ["—"]),
    "",
    "## Limitaciones",
    "",
    ...LIMITACIONES.map((limitacion) => `- ${limitacion}`),
    "",
  ];
  return lineas.join("\n");
}

function leerJson(archivo) {
  try {
    return JSON.parse(fs.readFileSync(archivo, "utf8"));
  } catch (error) {
    throw new Error(`no se pudo leer ${archivo}: ${error.message}`);
  }
}

/**
 * Genera `evals/reports/<experimento>.md` por cada experimento con evidencia
 * (baseline o corridas). Sin `experimento`, recorre todos. Devuelve las rutas
 * escritas (vacío si no hay evidencia).
 */
export function generarInformes({ root, experimento = null }) {
  const resultadosDir = path.join(root, "evals", "results");
  if (!fs.existsSync(resultadosDir)) return [];
  let nombres;
  if (experimento) {
    if (!fs.existsSync(path.join(resultadosDir, experimento))) {
      throw new Error(`no existe evals/results/${experimento}`);
    }
    nombres = [experimento];
  } else {
    nombres = fs
      .readdirSync(resultadosDir, { withFileTypes: true })
      .filter((entrada) => entrada.isDirectory())
      .map((entrada) => entrada.name)
      .sort();
  }
  const escritos = [];
  for (const nombre of nombres) {
    const dir = path.join(resultadosDir, nombre);
    const archivoBaseline = path.join(dir, "baseline.json");
    const baseline = fs.existsSync(archivoBaseline)
      ? BaselineSchema.parse(leerJson(archivoBaseline))
      : null;
    const corridas = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((entrada) => entrada.isDirectory() && /^run-\d+$/.test(entrada.name))
      .map((entrada) => {
        const archivo = path.join(dir, entrada.name, "result.json");
        if (!fs.existsSync(archivo)) return null;
        const resultado = ResultadoSchema.parse(leerJson(archivo));
        if (resultado.experimento !== nombre) {
          throw new Error(
            `${archivo} declara experimento "${resultado.experimento}" pero vive en "${nombre}"`,
          );
        }
        return resultado;
      })
      .filter((resultado) => resultado !== null)
      .sort((a, b) => a.run - b.run);
    if (!baseline && corridas.length === 0) continue;
    const informe = buildInforme({ experimento: nombre, baseline, corridas });
    const reportsDir = path.join(root, "evals", "reports");
    fs.mkdirSync(reportsDir, { recursive: true });
    const destino = path.join(reportsDir, `${nombre}.md`);
    fs.writeFileSync(destino, informe, "utf8");
    escritos.push(destino);
  }
  return escritos;
}
