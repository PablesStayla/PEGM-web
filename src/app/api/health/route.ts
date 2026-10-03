import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { settings } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = performance.now();
  try {
    const db = await getDb();
    const row = (
      await db.select({ id: settings.id }).from(settings).where(eq(settings.id, 1)).limit(1).all()
    )[0];
    if (!row) throw new Error("Ajustes no disponibles");

    return NextResponse.json(
      {
        status: "ok",
        database: "ok",
        latencyMs: Math.round(performance.now() - startedAt),
        revision: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
