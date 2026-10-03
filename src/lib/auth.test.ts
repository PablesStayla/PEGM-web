import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./auth";

describe("sesiones JWT", () => {
  it("firma y verifica un token", async () => {
    const token = await createSessionToken({
      email: "admin@pablo.cl",
      name: "Pablo",
    });
    const payload = await verifySessionToken(token);
    expect(payload).toEqual({ email: "admin@pablo.cl", name: "Pablo" });
  });

  it("rechaza tokens alterados", async () => {
    const token = await createSessionToken({
      email: "a@b.cl",
      name: "A",
    });
    expect(await verifySessionToken(`${token}x`)).toBeNull();
    expect(await verifySessionToken("no-es-un-jwt")).toBeNull();
    expect(await verifyTokenWithModifiedPayload(token)).toBeNull();
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
