import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hash de contraseñas (scrypt asíncrono)", () => {
  it("genera el formato salt:clave", async () => {
    expect(await hashPassword("secreto")).toMatch(/^[a-f0-9]{32}:[a-f0-9]{128}$/);
  });

  it("cada hash usa un salt distinto", async () => {
    expect(await hashPassword("secreto")).not.toBe(await hashPassword("secreto"));
  });

  it("verifica la contraseña correcta", async () => {
    const hash = await hashPassword("admin1234");
    expect(await verifyPassword("admin1234", hash)).toBe(true);
  });

  it("rechaza contraseñas incorrectas", async () => {
    const hash = await hashPassword("admin1234");
    expect(await verifyPassword("otra-cosa", hash)).toBe(false);
  });

  it("rechaza hashes corruptos sin lanzar error", async () => {
    expect(await verifyPassword("x", "formato-invalido")).toBe(false);
    expect(await verifyPassword("x", "")).toBe(false);
  });
});
