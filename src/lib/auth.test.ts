import { SignJWT } from "jose";
import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./auth";

describe("sesiones JWT", () => {
  it("firma y verifica un token", async () => {
    const token = await createSessionToken({
      email: "admin@pablo.cl",
      name: "Pablo",
      epoch: 3,
    });
    const payload = await verifySessionToken(token);
    expect(payload).toEqual({ email: "admin@pablo.cl", name: "Pablo", epoch: 3 });
  });

  it("rechaza tokens alterados", async () => {
    const token = await createSessionToken({
      email: "a@b.cl",
      name: "A",
      epoch: 0,
    });
    expect(await verifySessionToken(`${token}x`)).toBeNull();
    expect(await verifySessionToken("no-es-un-jwt")).toBeNull();
    expect(await verifyTokenWithModifiedPayload(token)).toBeNull();
  });

  it("rechaza tokens sin claim epoch (formato antiguo)", async () => {
    const legacy = await new SignJWT({ email: "a@b.cl", name: "A" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("secreto-de-desarrollo-cambiar-en-produccion"));
    expect(await verifySessionToken(legacy)).toBeNull();
  });
});

async function verifyTokenWithModifiedPayload(token: string) {
  // cambia un byte del payload manteniendo la firma: debe fallar la verificación
  const parts = token.split(".");
  const payload = JSON.parse(
    Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(),
  );
  payload.email = "intruso@pablo.cl";
  parts[1] = Buffer.from(JSON.stringify(payload))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return verifySessionToken(parts.join("."));
}
