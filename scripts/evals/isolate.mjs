/**
 * @file isolate.mjs
 * @description Utilidades para aislar el entorno de evaluación.
 * Crea directorios temporales, gestiona el estado de Git, y asegura que
 * cada ejecución de evaluación ocurra en un entorno limpio y controlado.
 */

import { execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Crea un directorio temporal aislado para una evaluación.
 * Cada llamada genera un directorio único con prefijo "eval-".
 *
 * @returns {string} Ruta absoluta al directorio temporal creado.
 */
export function createIsolatedDir() {
  return mkdtempSync(join(tmpdir(), "eval-"));
}

/**
 * Elimina un directorio temporal y todo su contenido de forma segura.
 *
 * @param {string} dirPath - Ruta absoluta al directorio a eliminar.
 */
export function cleanupDir(dirPath) {
  try {
    rmSync(dirPath, { recursive: true, force: true });
  } catch {
    // Ignorar errores de limpieza
  }
}

/**
 * Ejecuta un comando de Git en un directorio específico.
 *
 * @param {string} cwd - Directorio de trabajo.
 * @param {string[]} args - Argumentos del comando git.
 * @returns {string} Salida estándar del comando.
 * @throws {Error} Si el comando falla.
 */
export function git(cwd, ...args) {
  const result = execSync(["git", ...args].filter(Boolean).join(" "), {
    cwd,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  return result.trim();
}

/**
 * Verifica si el repositorio tiene cambios sin commitear.
 *
 * @param {string} cwd - Directorio del repositorio.
 * @returns {boolean} True si hay cambios sin commitear.
 */
export function hasUncommittedChanges(cwd) {
  const status = git(cwd, "status", "--porcelain");
  return status.trim().length > 0;
}

/**
 * Verifica si hay commits sin subir (no pusheados).
 *
 * @param {string} cwd - Directorio del repositorio.
 * @returns {boolean} True si hay commits sin subir.
 */
export function hasUnpushedCommits(cwd) {
  try {
    const status = git(cwd, "status", "--porcelain", "-b");
    return status.includes("ahead");
  } catch {
    return false;
  }
}

/**
 * Crea una rama aislada para una evaluación específica.
 *
 * @param {string} cwd - Directorio del repositorio.
 * @param {string} branchName - Nombre de la rama a crear.
 * @returns {string} Nombre de la rama creada.
 */
export function createEvalBranch(cwd, branchName) {
  git(cwd, "checkout", "-b", branchName);
  return branchName;
}

/**
 * Restaura el repositorio a un commit específico.
 *
 * @param {string} cwd - Directorio del repositorio.
 * @param {string} commit - Hash del commit al que regresar.
 */
export function resetToCommit(cwd, commit) {
  git(cwd, "checkout", commit);
}

/**
 * Obtiene el commit actual (HEAD).
 *
 * @param {string} cwd - Directorio del repositorio.
 * @returns {string} Hash del commit actual.
 */
export function getCurrentCommit(cwd) {
  return git(cwd, "rev-parse", "HEAD");
}

/**
 * Obtiene el nombre de la rama actual.
 *
 * @param {string} cwd - Directorio del repositorio.
 * @returns {string} Nombre de la rama actual.
 */
export function getCurrentBranch(cwd) {
  return git(cwd, "branch", "--show-current");
}
