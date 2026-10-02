import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit usa Turso cuando están definidas las variables de entorno
 * (TURSO_DATABASE_URL / TURSO_AUTH_TOKEN); si no, SQLite local en data/site.db.
 */

const url = process.env.TURSO_DATABASE_URL ?? "file:./data/site.db";
const isRemote = url.startsWith("libsql://") || url.startsWith("https://");

export default defineConfig({
  dialect: isRemote ? "turso" : "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  ...(isRemote
    ? { dbCredentials: { url, authToken: process.env.TURSO_AUTH_TOKEN } }
    : { dbCredentials: { url } }),
});
