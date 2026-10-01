import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";
import { seedIfEmpty } from "./seed";

export type Db = BetterSQLite3Database<typeof schema>;

let dbInstance: Db | null = null;

/**
 * Devuelve la instancia única de la base de datos.
 * En el primer arranque aplica las migraciones (drizzle/) y, si está vacía,
 * siembra el contenido inicial. Todo es idempotente.
 */
export function getDb(): Db {
  if (dbInstance) return dbInstance;

  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });

  const sqlite = new Database(path.join(dir, "site.db"));
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  dbInstance = drizzle(sqlite, { schema });

  // Las migraciones son idempotentes; reintentos ante eventuales locks
  // cuando varios procesos/workers arrancan a la vez (p. ej. durante build).
  for (let attempt = 1; ; attempt++) {
    try {
      migrate(dbInstance, {
        migrationsFolder: path.join(process.cwd(), "drizzle"),
      });
      break;
    } catch (error) {
      if (attempt >= 3) throw error;
    }
  }

  // La semilla solo inserta si la base está vacía; si otro proceso la sembró
  // primero (carrera), el error de unicidad se ignora.
  try {
    seedIfEmpty(dbInstance);
  } catch (error) {
    console.error("[db] semilla:", error);
  }

  return dbInstance;
}
