// Aceptación e4: debe existir al menos una prueba unitaria nueva/modificada
// (src/**/*.test.ts) que detecte la ruptura del recorte de espacios del
// ayudante nonEmptyString de src/lib/validation.ts.
//
// Procedimiento: detectar los tests cambiados con git, ejecutarlos (verde),
// mutar quirúrgicamente el ancla del trim en validation.ts, re-ejecutarlos
// (deben fallar) y restaurar el archivo original pase lo que pase.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUTA_VALIDATION = "src/lib/validation.ts";
const ANCLA = 'z.string().trim().min(1, `El campo ${campo} es obligatorio.`)';
const MUTADO = 'z.string().min(1, `El campo ${campo} es obligatorio.`)';

function ejecutar(args) {
  return spawnSync("pnpm", args, {
    cwd: RAIZ,
    shell: true,
    encoding: "utf8",
    timeout: 300_000,
  });
}

function salidaDe(resultado) {
  return `${resultado.stdout ?? ""}${resultado.stderr ?? ""}`.slice(-2000);
}

function testsCambiados() {
  const porcelain = spawnSync("git", ["status", "--porcelain"], {
    cwd: RAIZ,
    encoding: "utf8",
  });
  return (porcelain.stdout ?? "")
    .split("\n")
    .filter(Boolean)
    .map((linea) => {
      const crudo = linea
        .slice(3)
        .trim()
        .replace(/^"|"$/g, "");
      const ruta = crudo.includes(" -> ") ? crudo.split(" -> ")[1] : crudo;
      return ruta.replaceAll("\\", "/");
    })
    .filter((ruta) => /^src\/.+\.test\.ts$/.test(ruta));
}

const fallos = [];

// 1) Debe haber pruebas nuevas o modificadas, y pasar.
const archivos = testsCambiados();
if (archivos.length === 0) {
  console.error("[e4] ROJO:\n- no hay ninguna prueba nueva o modificada en src/**/*.test.ts");
  process.exit(1);
}

const verde = ejecutar(["exec", "vitest", "run", ...archivos]);
if (verde.status !== 0) {
  fallos.push(
    `las pruebas de la solución deben pasar con el código actual:\n${salidaDe(verde)}`,
  );
}

// 2) El ancla del trim debe existir tal cual (la tarea prohíbe tocar el archivo).
const original = fs.readFileSync(path.join(RAIZ, RUTA_VALIDATION), "utf8");
const ocurrencias = original.split(ANCLA).length - 1;
if (ocurrencias !== 1) {
  fallos.push(
    `${RUTA_VALIDATION} cambi\u00f3: se esperaba exactamente 1 ocurrencia de la definición de nonEmptyString con trim (encontradas: ${ocurrencias}). Esta tarea es solo de pruebas; el archivo no debe modificarse.`,
  );
}

// 3) Mutación: sin el trim, las pruebas deben fallar.
if (ocurrencias === 1) {
  const mutado = original.replace(ANCLA, MUTADO);
  try {
    fs.writeFileSync(path.join(RAIZ, RUTA_VALIDATION), mutado);
    const conMutacion = ejecutar(["exec", "vitest", "run", ...archivos]);
    if (conMutacion.status === 0) {
      fallos.push(
        `las pruebas (${archivos.join(", ")}) no detectan la mutación del trim en ${RUTA_VALIDATION}: siguen en verde con z.string().min(1, …); deben cubrir el caso de solo espacios y/o el recorte del valor.`,
      );
    }
  } finally {
    // Nunca dejar el árbol mutado.
    fs.writeFileSync(path.join(RAIZ, RUTA_VALIDATION), original);
  }
}

if (fallos.length > 0) {
  console.error(`[e4] ROJO:\n${fallos.map((fallo) => `- ${fallo}`).join("\n")}`);
  process.exit(1);
}
console.log(`[e4] OK — ${archivos.join(", ")} pasa y detecta la ruptura del trim.`);
