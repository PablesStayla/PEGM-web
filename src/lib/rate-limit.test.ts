import { describe, expect, it } from "vitest";
import { clientIp, rateLimitKey } from "./rate-limit";

describe("rate limit: helpers puros", () => {
  it("clientIp toma la primera IP de x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientIp(headers)).toBe("1.2.3.4");
  });

  it("clientIp usa x-real-ip como respaldo", () => {
    const headers = new Headers({ "x-real-ip": "9.9.9.9" });
    expect(clientIp(headers)).toBe("9.9.9.9");
  });

  it("clientIp devuelve 'desconocida' sin cabeceras", () => {
    expect(clientIp(new Headers())).toBe("desconocida");
  });

  it("rateLimitKey es determinista, hexadecimal y separa ámbitos", () => {
    const a = rateLimitKey("login", "1.2.3.4:a@b.cl");
    expect(a).toMatch(/^[a-f0-9]{64}$/);
    expect(rateLimitKey("login", "1.2.3.4:a@b.cl")).toBe(a);
    expect(rateLimitKey("contact", "1.2.3.4:a@b.cl")).not.toBe(a);
  });
});
