import fs from "node:fs";
import path from "node:path";
import { type Client, createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "./schema";
import { seedIfEmpty } from "./seed";

export type Db = LibSQLDatabase<typeof schema>;

/**
 * Capa de conexión a la base de datos (libSQL).
 *
 * - Local (desarrollo): SQLite en archivo `data/site.db` — sin cuenta ni red.
 * - Producción (Turso): definir `TURSO_DATABASE_URL` (libsql://…) y
 *   `TURSO_AUTH_TOKEN`; los cambios del panel persisten en serverless.
 *
 * En el primer arranque aplica las migraciones (drizzle/) y, si está vacía,
 * siembra el contenido inicial. Todo idempotente y a prueba de carreras
 * (singleton por promesa).
 */

let dbPromise: Promise<Db> | null = null;

function resolveUrl(): { url: string; authToken?: string } {
  const remoteUrl = process.env.TURSO_DATABASE_URL;
  if (remoteUrl && (remoteUrl.startsWith("libsql://") || remoteUrl.startsWith("https://"))) {
    return { url: remoteUrl, authToken: process.env.TURSO_AUTH_TOKEN };
  }
  // modo local: archivo SQLite
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return { url: `file:${path.join(dir, "site.db")}` };
}

async function initDb(): Promise<Db> {
  const { url, authToken } = resolveUrl();
  const isLocal = url.startsWith("file:");

  const client: Client = isLocal ? createClient({ url }) : createClient({ url, authToken });

  const db = drizzle(client, { schema });

  // Migraciones idempotentes; reintentos ante eventuales locks de arranque
  // cuando varios procesos arrancan a la vez (p. ej. durante build).
  for (let attempt = 1; ; attempt++) {
    try {
      await migrate(db, {
        migrationsFolder: path.join(process.cwd(), "drizzle"),
      });
      break;
    } catch (error) {
      if (attempt >= 3) throw error;
    }
  }

  // La semilla solo inserta si la base está vacía (transacción atómica);
  // si otro proceso la sembró primero, el único duplicado salta y se ignora.
  try {
    await seedIfEmpty(db);
  } catch (error) {
    console.error("[db] semilla:", error);
  }

  return db;
}

export function getDb(): Promise<Db> {
  dbPromise ??= initDb();
  return dbPromise;
}
