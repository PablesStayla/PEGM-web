/**
 * @file verify.mjs
 * @description Verificadores independientes para el harness de evaluación de agentes.
 * Cada verificador comprueba un aspecto específico sin depender de la
 * implementación del agente bajo prueba.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Verifica que el guard de credenciales de semilla rechace contraseñas por defecto
 * en producción. Esto verifica el hallazgo P0 de la auditoría de seguridad.
 *
 * @param {string} root - Directorio raíz del repositorio.
 * @returns {Promise<{passed: boolean, message: string, evidence: string[]}>}
 */
export async function verifySeedCredentialsFailFast(root) {
  const evidence = [];

  // Verificar que seed-credentials exista y tenga la clase SeedCredentialsError
  const seedCredentialsPath = join(root, "src/lib/seed-credentials.ts");
  if (!existsSync(seedCredentialsPath)) {
    return {
      passed: false,
      message: "Falta src/lib/seed-credentials.ts",
      evidence: ["Archivo src/lib/seed-credentials.ts no encontrado"],
    };
  }

  const seedContent = readFileSync(seedCredentialsPath, "utf8");
  if (!seedContent.includes("SeedCredentialsError")) {
    return {
      passed: false,
      message: "Falta la clase SeedCredentialsError en seed-credentials.ts",
      evidence: ["No se encontró la clase SeedCredentialsError en seed-credentials.ts"],
    };
  }

  // Verificar que el método rechace contraseña por defecto
  if (!seedContent.includes("DEFAULT_ADMIN_PASSWORD")) {
    return {
      passed: false,
      message: "Falta la constante DEFAULT_ADMIN_PASSWORD en seed-credentials.ts",
      evidence: ["No se encontró la constante DEFAULT_ADMIN_PASSWORD"],
    };
  }

  // Verificar que existe una comprobación de contraseña por defecto
  if (!seedContent.includes("DEFAULT_ADMIN_PASSWORD")) {
    return {
      passed: false,
      message: "No hay comprobación de contraseña por defecto en seed-credentials.ts",
      evidence: ["No se encontró comprobación de contraseña por defecto"],
    };
  }

  evidence.push("seed-credentials.ts contiene SeedCredentialsError");
  evidence.push("seed-credentials.ts rechaza contraseña por defecto");

  return {
    passed: true,
    message: "Guard de credenciales de semilla funciona correctamente",
    evidence,
  };
}

/**
 * Verifica que initDb propague SeedCredentialsError sin capturarlo.
 *
 * @param {string} root - Directorio raíz del repositorio.
 * @returns {Promise<{passed: boolean, message: string, evidence: string[]}>}
 */
export async function verifyInitDbPropagatesSeedError(root) {
  const evidence = [];

  const dbIndexPath = join(root, "src/db/index.ts");
  if (!existsSync(dbIndexPath)) {
    return {
      passed: false,
      message: "Falta src/db/index.ts",
      evidence: ["Archivo src/db/index.ts no encontrado"],
    };
  }

  const dbContent = readFileSync(dbIndexPath, "utf8");

  // Verificar que existe la importación de SeedCredentialsError
  if (!dbContent.includes("SeedCredentialsError")) {
    return {
      passed: false,
      message: "Falta la importación de SeedCredentialsError en src/db/index.ts",
      evidence: ["No se encontró import de SeedCredentialsError en src/db/index.ts"],
    };
  }

  // Verificar que hay un rethrow (no solo console.error)
  const hasRethrow = dbContent.includes("throw error") || dbContent.includes("throw error");
  if (!hasRethrow) {
    return {
      passed: false,
      message: "initDb no propaga SeedCredentialsError (no hay rethrow)",
      evidence: ["No se encontró rethrow de SeedCredentialsError en initDb"],
    };
  }

  evidence.push("initDb importa SeedCredentialsError");
  evidence.push("initDb propaga SeedCredentialsError (no la captura)");

  return {
    passed: true,
    message: "initDb propaga correctamente SeedCredentialsError",
    evidence,
  };
}

/**
 * Verifica que `resolveInitialAdminCredentials` rechace credenciales por defecto.
 *
 * @param {string} root - Directorio raíz del repositorio.
 * @returns {Promise<{passed: boolean, message: string, evidence: string[]}>}
 */
export async function verifyCredentialsFailFast(root) {
  const evidence = [];

  // Verificar que el módulo seed-credentials exista
  const seedCredentialsPath = join(root, "src/lib/seed-credentials.ts");
  if (!existsSync(seedCredentialsPath)) {
    return {
      passed: false,
      message: "Falta src/lib/seed-credentials.ts",
      evidence: ["Archivo src/lib/seed-credentials.ts no encontrado"],
    };
  }

  const content = readFileSync(seedCredentialsPath, "utf8");

  // Verificar que existe la clase SeedCredentialsError
  if (!content.includes("SeedCredentialsError")) {
    return {
      passed: false,
      message: "Falta la clase SeedCredentialsError en seed-credentials.ts",
      evidence: ["No se encontró la clase SeedCredentialsError"],
    };
  }

  // Verificar que rechace contraseña por defecto
  if (!content.includes("DEFAULT_ADMIN_PASSWORD")) {
    return {
      passed: false,
      message: "Falta comprobación de contraseña por defecto en seed-credentials.ts",
      evidence: ["No se encontró comprobación de contraseña por defecto"],
    };
  }

  evidence.push("seed-credentials.ts exporta SeedCredentialsError");
  evidence.push("seed-credentials.ts rechaza contraseña por defecto");
  evidence.push("resolveInitialAdminCredentials rechaza credenciales por defecto");

  return {
    passed: true,
    message: "Guard de credenciales de semilla funciona correctamente",
    evidence,
  };
}

/**
 * Verifica que existan las skills compartidas requeridas.
 *
 * @param {string} root - Directorio raíz del repositorio.
 * @returns {Promise<{passed: boolean, message: string, evidence: string[]}>}
 */
export function verifySkillsExist(root) {
  const skillsDir = join(root, ".agents", "skills");
  if (!existsSync(skillsDir)) {
    return {
      passed: false,
      message: "Falta el directorio .agents/skills/",
      evidence: ["Directorio .agents/skills/ no encontrado"],
    };
  }

  const requiredSkills = ["feature-workflow", "security-review", "task-handoff"];
  const missing = [];

  for (const skill of requiredSkills) {
    const skillPath = join(skillsDir, skill, "SKILL.md");
    if (!existsSync(skillPath)) {
      missing.push(skill);
    }
  }

  if (missing.length > 0) {
    return {
      passed: false,
      message: `Faltan skills: ${missing.join(", ")}`,
      evidence: missing.map((m) => `Falta: .agents/skills/${m}/SKILL.md`),
    };
  }

  evidence.push(`Skills presentes: ${requiredSkills.join(", ")}`);
  return {
    passed: true,
    message: "Todas las skills compartidas están presentes",
    evidence,
  };
}

/**
 * Ejecuta todos los verificadores disponibles.
 *
 * @param {string} root - Directorio raíz del repositorio.
 * @returns {Promise<{passed: boolean, results: Array<{name: string, passed: boolean, message: string, evidence: string[]}>}>}
 */
export async function runAllVerifiers(root) {
  const verifiers = [
    { name: "seed-credentials-fail-fast", fn: () => verifySeedCredentialsFailFast(root) },
    { name: "initDb-propagates-seed-error", fn: () => verifyInitDbPropagatesSeedError(root) },
    { name: "skills-exist", fn: () => verifySkillsExist(root) },
  ];

  const results = [];
  let allPassed = true;

  for (const { name, fn } of verifiers) {
    try {
      const result = await fn();
      results.push({ name, ...result });
      if (!result.passed) {
        allPassed = false;
      }
    } catch (error) {
      results.push({
        name,
        passed: false,
        message: `Error ejecutando verificador: ${error.message}`,
        evidence: [error.message],
      });
      allPassed = false;
    }
  }

  return { passed: allPassed, results };
}

export {
  runAllVerifiers,
  verifyInitDbPropagatesSeedError,
  verifySeedCredentialsFailFast,
  verifySkillsExist,
};
