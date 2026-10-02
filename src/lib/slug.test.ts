import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("convierte espacios y minúsculas", () => {
    expect(slugify("Optimización del circuito")).toBe("optimizacion-del-circuito");
  });

  it("elimina acentos (NFD)", () => {
    expect(slugify("lixiviación ácida")).toBe("lixiviacion-acida");
  });

  it("colapsa símbolos y guiones repetidos", () => {
    expect(slugify("Planta SX-EW: ¿lista?")).toBe("planta-sx-ew-lista");
  });

  it("recorta guiones de los extremos", () => {
    expect(slugify("--hola--")).toBe("hola");
  });
});
