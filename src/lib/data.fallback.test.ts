import { describe, expect, it, vi } from "vitest";
import { getProjects } from "./data";

vi.mock("@/db", () => ({
  getDb: vi.fn(() => {
    throw new Error("BD no disponible");
  }),
}));

describe("getProjects: degradación elegante cuando la BD no está disponible", () => {
  it("devuelve [] cuando la BD no está disponible", async () => {
    expect(await getProjects()).toEqual([]);
  });
});
