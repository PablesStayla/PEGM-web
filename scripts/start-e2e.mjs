import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

// La limpieza ocurre antes del servidor, exclusivamente sobre la BD de pruebas.
const require = createRequire(import.meta.url);
const dataDirectory = path.resolve("data");
for (const file of ["e2e.db", "e2e.db-wal", "e2e.db-shm"]) {
  const target = path.resolve(dataDirectory, file);
  if (path.dirname(target) !== dataDirectory) throw new Error("Ruta de prueba inválida");
  rmSync(target, { force: true });
}
const server = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "dev", "-p", process.argv[2] ?? "3100"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "file:./data/e2e.db",
      // Credenciales semilla de las pruebas fijadas explícitamente: no deben
      // depender de un .env local (las variables de entorno reales tienen
      // prioridad sobre los archivos .env en Next.js).
      ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "admin@pablo.cl",
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "admin1234",
    },
  },
);
server.on("exit", (code) => {
  process.exit(code ?? 1);
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.kill(signal);
  });
