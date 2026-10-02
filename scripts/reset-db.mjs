import { rmSync } from "node:fs";

/**
 * Elimina la base de datos LOCAL (data/site.db) para que se recree con
 * datos semilla en el próximo arranque.
 *
 * Nota: con Turso remoto (TURSO_DATABASE_URL) este script no aplica;
 * para reiniciar la base remota, borrarla y crearla de nuevo con el CLI:
 *   turso db destroy pablo-site && turso db create pablo-site
 */

for (const file of ["data/site.db", "data/site.db-wal", "data/site.db-shm"]) {
  try {
    rmSync(file);
    console.log(`Eliminado: ${file}`);
  } catch {
    // el archivo no existe
  }
}

console.log("Listo. La base local se recreará con datos semilla en el próximo arranque.");
