import { jwtVerify, SignJWT } from "jose";

/**
 * Sesiones con JWT firmado (HS256) guardado en cookie HttpOnly.
 * Este módulo es compatible con el runtime Edge (middleware) y Node:
 * no importa nada de Node.js ni de la base de datos.
 */

export const SESSION_COOKIE = "pk_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export type SessionPayload = {
  email: string;
  name: string;
};

function getSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "secreto-de-desarrollo-cambiar-en-produccion",
  );
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    return { email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: SESSION_MAX_AGE,
  path: "/",
};
