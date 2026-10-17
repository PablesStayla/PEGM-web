// Arranca el servidor de desarrollo de la aceptación (puerto y BD propios).
// Espejo de scripts/start-e2e.mjs, pero autocontenido dentro del clon:
// este archivo vive en <clon>/acceptance/start-server.mjs.
import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDirectory = path.resolve(raiz, "data");

for (const archivo of ["acceptance.db", "acceptance.db-wal", "acceptance.db-shm"]) {
  const objetivo = path.resolve(dataDirectory, archivo);
  if (path.dirname(objetivo) !== dataDirectory) {
    throw new Error(`Ruta de prueba inválida: ${archivo}`);
  }
  rmSync(objetivo, { force: true });
}

const servidor = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "dev", "-p", process.argv[2] ?? "3200"],
  {
    cwd: raiz,
    stdio: "inherit",
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "file:./data/acceptance.db",
      ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "admin@pablo.cl",
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "admin1234",
    },
  },
);

servidor.on("exit", (codigo) => process.exit(codigo ?? 1));
for (const senal of ["SIGINT", "SIGTERM"]) {
  process.on(senal, () => servidor.kill(senal));
}
