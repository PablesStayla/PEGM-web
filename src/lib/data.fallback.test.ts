import { describe, expect, it, vi } from "vitest";
import { projects as seedProjects } from "@/lib/content";
import { getProjects } from "./data";

vi.mock("@/db", () => ({
  getDb: vi.fn(() => {
    throw new Error("BD no disponible");
  }),
}));

describe("getProjects: degradación elegante cuando la BD no está disponible", () => {
  it("devuelve el contenido semilla para que el sitio no se rompa", async () => {
    const esperado = seedProjects.map((project, index) => ({
      ...project,
      id: index + 1,
      sortOrder: index,
    }));
    expect(await getProjects()).toEqual(esperado);
  });
});
