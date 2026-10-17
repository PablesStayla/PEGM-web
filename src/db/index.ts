import fs from "node:fs";
import path from "node:path";
import { type Client, createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { SeedCredentialsError } from "@/lib/seed-credentials";
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
  const configured = process.env.TURSO_DATABASE_URL;
  if (configured?.startsWith("libsql://") || configured?.startsWith("https://")) {
    return { url: configured, authToken: process.env.TURSO_AUTH_TOKEN };
  }
  if (configured?.startsWith("file:")) {
    // ruta explícita (p. ej. base de pruebas E2E) — asegura el directorio
    const file = configured.slice("file:".length);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    return { url: configured };
  }
  // modo local por defecto: archivo SQLite
  // En producción, exigir URL explícita de Turso; no caer silenciosamente a SQLite local
  // (el almacenamiento efímero de Vercel perdería datos al redeploy).
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "TURSO_DATABASE_URL es obligatoria en producción. Defínela en Vercel → Settings → Environment Variables.",
    );
  }
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return { url: `file:${path.join(dir, "site.db")}` };
}

async function initDb(): Promise<Db> {
  const { url, authToken } = resolveUrl();
  const isLocal = url.startsWith("file:");

  const client: Client = isLocal ? createClient({ url }) : createClient({ url, authToken });

  // SQLite local en modo WAL: los lectores no bloquean a los escritores (y
  // viceversa), clave cuando varias rutas/acciones comparten el archivo en
  // desarrollo. busy_timeout hace que los escritores esperen en lugar de
  // fallar con SQLITE_BUSY ante una contención momentánea.
  if (isLocal) {
    await client.execute("PRAGMA journal_mode = WAL");
    await client.execute("PRAGMA busy_timeout = 5000");
  }

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
  // La configuración de credenciales, en cambio, es fatal (fail-fast):
  // en producción, un arranque sin ADMIN_* configurados no debe degradarse.
  try {
    await seedIfEmpty(db);
  } catch (error) {
    if (error instanceof SeedCredentialsError) throw error;
    console.error("[db] semilla:", error);
  }

  return db;
}

export function getDb(): Promise<Db> {
  dbPromise ??= initDb();
  return dbPromise;
}
