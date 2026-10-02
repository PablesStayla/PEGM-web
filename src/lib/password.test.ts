import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hash de contraseñas (scrypt)", () => {
  it("genera el formato salt:clave", () => {
    expect(hashPassword("secreto")).toMatch(/^[a-f0-9]{32}:[a-f0-9]{128}$/);
  });

  it("cada hash usa un salt distinto", () => {
    expect(hashPassword("secreto")).not.toBe(hashPassword("secreto"));
  });

  it("verifica la contraseña correcta", () => {
    const hash = hashPassword("admin1234");
    expect(verifyPassword("admin1234", hash)).toBe(true);
  });

  it("rechaza contraseñas incorrectas", () => {
    const hash = hashPassword("admin1234");
    expect(verifyPassword("otra-cosa", hash)).toBe(false);
  });

  it("rechaza hashes corruptos sin lanzar error", () => {
    expect(verifyPassword("x", "formato-invalido")).toBe(false);
    expect(verifyPassword("x", "")).toBe(false);
  });
});
