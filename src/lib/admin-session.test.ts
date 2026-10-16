import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdminSession } from "./admin-session";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));
vi.mock("./auth", () => ({
  verifySessionToken: vi.fn(),
  SESSION_COOKIE: "pk_session",
}));
vi.mock("./data", () => ({
  adminSessionEpoch: vi.fn(),
}));

import { cookies } from "next/headers";
import { verifySessionToken } from "./auth";
import { adminSessionEpoch } from "./data";

type SessionPayload = { email: string; name: string; epoch: number };

const session: SessionPayload = { email: "a@b.cl", name: "A", epoch: 1 };

const mockCookies = vi.mocked(cookies) as ReturnType<typeof vi.fn>;

const conCookie = (value: string | undefined) => {
  mockCookies.mockResolvedValue({ get: () => ({ value }) });
};

describe("requireAdminSession: la revocación por epoch protege las Server Actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("lanza si no hay cookie de sesión", async () => {
    conCookie(undefined);
    await expect(requireAdminSession()).rejects.toThrow("No autorizado");
  });

  it("lanza si el epoch del token es obsoleto (contraseña cambiada)", async () => {
    conCookie("tok");
    vi.mocked(verifySessionToken).mockResolvedValue(session);
    // El token dice epoch 1, pero la BD ya está en 5 tras un cambio de contraseña.
    vi.mocked(adminSessionEpoch).mockResolvedValue(5);
    await expect(requireAdminSession()).rejects.toThrow("No autorizado");
  });

  it("lanza si el usuario ya no existe en la BD (epoch nulo)", async () => {
    conCookie("tok");
    vi.mocked(verifySessionToken).mockResolvedValue(session);
    vi.mocked(adminSessionEpoch).mockResolvedValue(null);
    await expect(requireAdminSession()).rejects.toThrow("No autorizado");
  });

  it("devuelve la sesión cuando el epoch coincide con la BD", async () => {
    conCookie("tok");
    vi.mocked(verifySessionToken).mockResolvedValue(session);
    vi.mocked(adminSessionEpoch).mockResolvedValue(1);
    await expect(requireAdminSession()).resolves.toEqual(session);
  });
});
