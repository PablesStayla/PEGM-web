/**
 * Helper de pruebas: crea una base de datos SQLite en memoria aislada, aplica
 * las migraciones de Drizzle y la devuelve lista para usar. Cada prueba que la
 * use obtiene su propia BD, sin tocar `data/site.db` ni escribir en disco.
 */

import path from "node:path";
import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "@/db/schema";

export async function makeTestDb(): Promise<{
  db: LibSQLDatabase<typeof schema>;
  cleanup: () => void;
}> {
  const client = createClient({ url: ":memory:" });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  const cleanup = () => {
    try {
      client.close();
    } catch {
      // ignorar: ya puede estar cerrado
    }
  };
  return { db, cleanup };
}
