#!/usr/bin/env node

import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL ?? `file:${path.join(process.cwd(), "data/site.db")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient(url.startsWith("file:") ? { url } : { url, authToken });

const tables = [
  "users",
  "settings",
  "projects",
  "experience",
  "education",
  "certifications",
  "skills",
  "languages",
  "messages",
  "audit_log",
];

function serializable(value) {
  if (typeof value === "bigint") return Number(value);
  if (value instanceof Uint8Array) return Buffer.from(value).toString("base64");
  return value;
}

const backup = {
  format: "pegm-web-backup@1",
  createdAt: new Date().toISOString(),
  source: url.startsWith("file:") ? "local" : "remote",
  tables: {},
};

try {
  for (const table of tables) {
    const result = await client.execute(`SELECT * FROM "${table}"`);
    backup.tables[table] = result.rows.map((row) =>
      Object.fromEntries(Object.entries(row).map(([key, value]) => [key, serializable(value)])),
    );
  }

  const directory = path.join(process.cwd(), "backups");
  mkdirSync(directory, { recursive: true });
  const timestamp = backup.createdAt.replaceAll(":", "-").replaceAll(".", "-");
  const file = path.join(directory, `site-${timestamp}.json`);
  writeFileSync(file, `${JSON.stringify(backup, null, 2)}\n`, { mode: 0o600 });
  chmodSync(file, 0o600);
  console.log(`Backup creado: ${path.relative(process.cwd(), file)}`);
  console.log("Contiene datos privados: mantenlo cifrado y fuera del repositorio.");
} catch (error) {
  console.error("No se pudo crear el backup:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  client.close();
}
