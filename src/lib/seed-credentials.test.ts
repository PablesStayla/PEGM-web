import { describe, expect, it } from "vitest";
import { resolveInitialAdminCredentials } from "./seed-credentials";

describe("resolveInitialAdminCredentials", () => {
  it("usa credenciales por defecto fuera de producción", () => {
    expect(resolveInitialAdminCredentials({ NODE_ENV: "development" })).toEqual({
      email: "admin@pablo.cl",
      password: "admin1234",
    });
  });

  it("respeta las variables definidas fuera de producción", () => {
    expect(
      resolveInitialAdminCredentials({
        NODE_ENV: "test",
        ADMIN_EMAIL: "otro@pablo.cl",
        ADMIN_PASSWORD: "secreta-123456",
      }),
    ).toEqual({ email: "otro@pablo.cl", password: "secreta-123456" });
  });

  it("exige ADMIN_EMAIL y ADMIN_PASSWORD en producción", () => {
    expect(() => resolveInitialAdminCredentials({ NODE_ENV: "production" })).toThrow(/ADMIN_EMAIL/);
  });

  it("rechaza la contraseña por defecto en producción", () => {
    expect(() =>
      resolveInitialAdminCredentials({
        NODE_ENV: "production",
        ADMIN_EMAIL: "pablo@dominio.cl",
        ADMIN_PASSWORD: "admin1234",
      }),
    ).toThrow(/por defecto/);
  });

  it("acepta credenciales explícitas en producción", () => {
    expect(
      resolveInitialAdminCredentials({
        NODE_ENV: "production",
        ADMIN_EMAIL: "pablo@dominio.cl",
        ADMIN_PASSWORD: "una-clave-larga-y-unica",
      }),
    ).toEqual({ email: "pablo@dominio.cl", password: "una-clave-larga-y-unica" });
  });
});
