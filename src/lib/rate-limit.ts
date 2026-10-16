import { createHmac } from "node:crypto";
import { eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { rateLimits } from "@/db/schema";

/**
 * Rate limiting con ventanas fijas en la base de datos (compartido entre
 * instancias serverless). Las claves son HMAC-SHA256: nunca se guardan IPs
 * ni correos en claro.
 */

export function rateLimitKey(scope: string, value: string): string {
  const secret = process.env.AUTH_SECRET ?? "secreto-de-desarrollo-cambiar-en-produccion";
  return createHmac("sha256", secret).update(`${scope}:${value}`).digest("hex");
}

/** IP del cliente a partir de las cabeceras del proxy (Vercel). */
export function clientIp(header: { get(name: string): string | null }): string {
  const forwarded = header.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "desconocida";
  return header.get("x-real-ip")?.trim() || "desconocida";
}

/**
 * Consume un intento. Devuelve true si está permitido.
 * Upsert atómico con `RETURNING`: la ventana se resetea sola al cambiar.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const db = await getDb();
  const now = Date.now();
  const windowStart = now - (now % windowMs);

  const rows = await db
    .insert(rateLimits)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        windowStart: sql`excluded.window_start`,
        count: sql`case when ${rateLimits.windowStart} = excluded.window_start then ${rateLimits.count} + 1 else 1 end`,
      },
    })
    .returning({ count: rateLimits.count })
    .all();

  const count = rows[0]?.count ?? 1;

  // Purga perezosa: al abrir ventana nueva, limpia las vencidas (índice por window_start).
  if (count === 1) {
    await db
      .delete(rateLimits)
      .where(lt(rateLimits.windowStart, windowStart - windowMs))
      .run();
  }

  return count <= limit;
}

/** Limpia el contador (p. ej. tras un login exitoso). */
export async function resetRateLimit(key: string): Promise<void> {
  const db = await getDb();
  await db.delete(rateLimits).where(eq(rateLimits.key, key)).run();
}
