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
    const k = rateLimitKey("x", "1.2.3.4");
    expect(await consumeRateLimit(k, 1, 100)).toBe(true);
    expect(await consumeRateLimit(k, 1, 100)).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(await consumeRateLimit(k, 1, 100)).toBe(true);
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
