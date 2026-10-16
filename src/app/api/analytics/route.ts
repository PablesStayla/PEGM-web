import { createHmac } from "node:crypto";
import { and, count, eq, gte, lt, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { analyticsEvents } from "@/db/schema";
import {
  cleanCampaign,
  EVENT_NAMES,
  isLocalHostname,
  PUBLIC_PATHS,
  safeLabel,
} from "@/lib/analytics/shared";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";
const eventSchema = z
  .object({
    id: z.uuid(),
    pageId: z.uuid(),
    name: z.enum(EVENT_NAMES),
    path: z.string().refine((path) => PUBLIC_PATHS.includes(path)),
    label: z.string().max(80).default("").refine(safeLabel),
    value: z.number().finite().min(0).max(60000).default(0),
    activeSeconds: z.number().int().min(0).max(3600).default(0),
    scrollDepth: z.number().int().min(0).max(100).default(0),
  })
  .strict();
const payloadSchema = z
  .object({
    consent: z.literal(true),
    visitorId: z.uuid(),
    sessionId: z.uuid(),
    source: z
      .string()
      .max(100)
      .regex(/^[a-zA-Z0-9_. -]+$/),
    campaign: z.string().max(64),
    events: z.array(eventSchema).min(1).max(20),
  })
  .strict();

export async function POST(request: NextRequest) {
  const empty = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  if (process.env.ANALYTICS_DISABLED === "true") return empty();
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return new Response(null, { status: 403 });
  if (request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1") return empty();
  if (isLocalHostname(request.nextUrl.hostname) && process.env.ANALYTICS_ALLOW_LOCALHOST !== "true")
    return empty();
  const ua = request.headers.get("user-agent") ?? "";
  if (/bot|crawler|spider|headless|lighthouse|preview/i.test(ua)) return empty();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token && (await verifySessionToken(token))) return empty();
  if (Number(request.headers.get("content-length")) > 16000)
    return new Response(null, { status: 413 });
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > 16000) return new Response(null, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) return new Response(null, { status: 400 });
  const secret = process.env.ANALYTICS_SECRET ?? process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") return new Response(null, { status: 503 });
  const digest = (value: string) =>
    createHmac("sha256", secret ?? "local-analytics-development")
      .update(value)
      .digest("hex");
  const data = parsed.data;
  const sessionId = digest(`session:${data.sessionId}`);
  const now = Date.now();
  try {
    const db = await getDb();
    // Límite persistente, compartido entre instancias; el filtrado perimetral complementa esto.
    const [recent] = await db
      .select({ n: count() })
      .from(analyticsEvents)
      .where(
        and(eq(analyticsEvents.sessionId, sessionId), gte(analyticsEvents.createdAt, now - 60000)),
      );
    if (recent.n + data.events.length > 100) return new Response(null, { status: 429 });
    const device = /ipad|tablet/i.test(ua)
      ? "Tablet"
      : /mobile|android|iphone/i.test(ua)
        ? "Móvil"
        : "Escritorio";
    const browser = /Edg\//.test(ua)
      ? "Edge"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Otro";
    const geo = process.env.VERCEL === "1" ? request.headers.get("x-vercel-ip-country") : null;
    const country = geo && /^[A-Z]{2}$/.test(geo) ? geo : "Desconocido";
    await db.transaction(async (tx) => {
      for (const event of data.events) {
        const id = digest(`${data.visitorId}:${event.id}`);
        await tx
          .insert(analyticsEvents)
          .values({
            ...event,
            id,
            pageId: digest(`${data.visitorId}:${event.pageId}`),
            visitorId: digest(`visitor:${data.visitorId}`),
            sessionId,
            source: data.source,
            campaign: cleanCampaign(data.campaign),
            device,
            browser,
            country,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: analyticsEvents.id,
            set: {
              activeSeconds: sql`max(${analyticsEvents.activeSeconds}, ${event.activeSeconds})`,
              scrollDepth: sql`max(${analyticsEvents.scrollDepth}, ${event.scrollDepth})`,
              value: event.value,
              updatedAt: now,
            },
            setWhere: and(
              eq(analyticsEvents.sessionId, sessionId),
              eq(analyticsEvents.name, event.name),
            ),
          });
      }
      // Retención acotada: evita crecer indefinidamente en el plan gratuito.
      await tx.delete(analyticsEvents).where(lt(analyticsEvents.createdAt, now - 180 * 86400000));
    });
    return empty();
  } catch (error) {
    console.error(
      "[analytics] no se pudieron registrar eventos",
      error instanceof Error ? error.name : "error",
    );
    return new Response(null, { status: 503 });
  }
}
