import { lt } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "@/db";
import { auditLog } from "@/db/schema";
import { clientIp, rateLimitKey } from "@/lib/rate-limit";

const RETENTION_MS = 365 * 24 * 60 * 60 * 1000;
const DIFF_LIMIT = 4000;

export type AuditEntry = {
  userEmail: string;
  /** Texto humano visible en el panel ("actualizó", "inició sesión", …). */
  action: string;
  entity: string;
  detail?: string;
  /** Clave máquina estable para filtrar ("content.update", "auth.login_failure", …). */
  event: string;
  /** Estado anterior/posterior para el diff (nunca contraseñas ni tokens). */
  before?: unknown;
  after?: unknown;
};

/** Registra una entrada de auditoría con IP hasheada y user-agent. */
export async function audit(entry: AuditEntry): Promise<void> {
  const headerList = await headers();
  const db = await getDb();
  const hasDiff = entry.before !== undefined || entry.after !== undefined;
  await db
    .insert(auditLog)
    .values({
      userEmail: entry.userEmail,
      action: entry.action,
      entity: entry.entity,
      detail: entry.detail ?? "",
      event: entry.event,
      ipHash: rateLimitKey("audit-ip", clientIp(headerList)),
      userAgent: (headerList.get("user-agent") ?? "").slice(0, 300),
      diff: hasDiff
        ? JSON.stringify({ before: entry.before ?? null, after: entry.after ?? null }).slice(
            0,
            DIFF_LIMIT,
          )
        : "",
    })
    .run();
}

/** Retención de 365 días (purga perezosa; se invoca en el login y al leer auditoría). */
export async function purgeOldAuditLog(): Promise<void> {
  const db = await getDb();
  await db
    .delete(auditLog)
    .where(lt(auditLog.createdAt, new Date(Date.now() - RETENTION_MS)))
    .run();
}
