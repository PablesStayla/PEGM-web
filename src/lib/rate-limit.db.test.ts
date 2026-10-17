import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({ getDb: vi.fn() }));

import { getDb } from "@/db";
import { consumeRateLimit, rateLimitKey, resetRateLimit } from "./rate-limit";
import { makeTestDb } from "./test-db";

describe("consumeRateLimit: control de tasa contra BD real", () => {
  let cleanup: () => void;
  beforeEach(async () => {
    const { db, cleanup: c } = await makeTestDb();
    vi.mocked(getDb).mockResolvedValue(db);
    cleanup = c;
  });
  afterEach(() => cleanup());

  const key = rateLimitKey("contact", "1.2.3.4");

  it("permite hasta el límite y rechaza el exceso", async () => {
    for (let i = 0; i < 5; i++) {
      expect(await consumeRateLimit(key, 5, 60 * 60 * 1000)).toBe(true);
    }
    expect(await consumeRateLimit(key, 5, 60 * 60 * 1000)).toBe(false);
  });

  it("resetea el contador al cambiar la ventana de tiempo", async () => {
    // Ventanas fijas alineadas a Date.now(): con reloj real, un runner lento
    // puede cruzar el límite de 100 ms entre llamadas (flake). Se simula solo
    // Date, dejando setTimeout real para el I/O de libsql.
    vi.useFakeTimers({ toFake: ["Date"], now: 10_000_050 });
    try {
      const k = rateLimitKey("x", "1.2.3.4");
      expect(await consumeRateLimit(k, 1, 100)).toBe(true);
      vi.setSystemTime(10_000_060);
      expect(await consumeRateLimit(k, 1, 100)).toBe(false);
      vi.setSystemTime(10_000_200);
      expect(await consumeRateLimit(k, 1, 100)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("resetRateLimit limpia el contador de una clave", async () => {
    const k = rateLimitKey("r", "1.2.3.4");
    expect(await consumeRateLimit(k, 1, 60 * 60 * 1000)).toBe(true);
    expect(await consumeRateLimit(k, 1, 60 * 60 * 1000)).toBe(false);
    await resetRateLimit(k);
    expect(await consumeRateLimit(k, 1, 60 * 60 * 1000)).toBe(true);
  });

  it("claves distintas son independientes", async () => {
    const a = rateLimitKey("contact", "1.2.3.4");
    const b = rateLimitKey("contact", "5.6.7.8");
    expect(await consumeRateLimit(a, 1, 60 * 60 * 1000)).toBe(true);
    expect(await consumeRateLimit(a, 1, 60 * 60 * 1000)).toBe(false);
    expect(await consumeRateLimit(b, 1, 60 * 60 * 1000)).toBe(true);
  });
});
