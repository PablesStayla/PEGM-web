import { rmSync } from "node:fs";

for (const file of ["data/site.db", "data/site.db-wal", "data/site.db-shm"]) {
  try {
    rmSync(file);
    console.log(`Eliminado: ${file}`);
  } catch {
    // el archivo no existe
  }
}

console.log("Listo. La base de datos se recreará con datos semilla en el próximo arranque.");
