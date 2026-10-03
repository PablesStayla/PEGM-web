import { createHmac } from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "@/db";
import { rateLimits } from "@/db/schema";

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

function rateLimitSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET es obligatoria para proteger los identificadores de rate limit.");
  }
  return secret ?? "development-rate-limit-secret";
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
};

/**
 * Identificador irreversible de la solicitud. Nunca persiste IP, correo ni
 * user-agent en claro; AUTH_SECRET impide correlacionar el hash fuera del sitio.
 */
export async function requestFingerprint(extra = ""): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip =
    forwarded ||
    requestHeaders.get("cf-connecting-ip") ||
    requestHeaders.get("x-real-ip") ||
    "local";
  const userAgent = requestHeaders.get("user-agent") ?? "unknown";
  return createHmac("sha256", rateLimitSecret())
    .update(`${ip}|${userAgent}|${extra}`)
    .digest("hex");
}

/**
 * Ventana fija almacenada en libSQL/Turso. Al vivir en la base funciona entre
 * instancias serverless, a diferencia de un Map en memoria.
 */
export async function consumeRateLimit(
  scope: string,
  identifier: string,
  { limit, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> {
  const db = await getDb();
  const key = createHmac("sha256", rateLimitSecret())
    .update(`${scope}:${identifier}`)
    .digest("hex");
  const now = Date.now();

  return db.transaction(async (tx) => {
    const row = (
      await tx.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1).all()
    )[0];

    if (!row || row.expiresAt.getTime() <= now) {
      const windowStart = new Date(now);
      const expiresAt = new Date(now + windowMs);
      await tx
        .insert(rateLimits)
        .values({ key, count: 1, windowStart, expiresAt })
        .onConflictDoUpdate({
          target: rateLimits.key,
          set: { count: 1, windowStart, expiresAt },
        })
        .run();
      return { allowed: true, remaining: Math.max(0, limit - 1), retryAfter: 0 };
    }

    const retryAfter = Math.max(1, Math.ceil((row.expiresAt.getTime() - now) / 1000));
    if (row.count >= limit) return { allowed: false, remaining: 0, retryAfter };

    await tx
      .update(rateLimits)
      .set({ count: row.count + 1 })
      .where(eq(rateLimits.key, key))
      .run();
    return {
      allowed: true,
      remaining: Math.max(0, limit - row.count - 1),
      retryAfter: 0,
    };
  });
}

export async function clearRateLimit(scope: string, identifier: string): Promise<void> {
  const db = await getDb();
  const key = createHmac("sha256", rateLimitSecret())
    .update(`${scope}:${identifier}`)
    .digest("hex");
  await db.delete(rateLimits).where(eq(rateLimits.key, key)).run();
}
