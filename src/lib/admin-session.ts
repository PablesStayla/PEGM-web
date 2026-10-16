import { cookies } from "next/headers";
import { SESSION_COOKIE, type SessionPayload, verifySessionToken } from "@/lib/auth";
import { adminSessionEpoch } from "@/lib/data";

/**
 * Guard de sesión para Server Actions y datos de administración (runtime Node).
 * Además de la firma del JWT, exige que el epoch del token coincida con el de
 * la cuenta: el cambio de contraseña revoca así, de verdad, toda sesión previa
 * (el proxy Edge no puede consultar la BD; este guard sí).
 */
export async function requireAdminSession(): Promise<SessionPayload> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) throw new Error("No autorizado");

  const epoch = await adminSessionEpoch(session.email);
  if (epoch === null || epoch !== session.epoch) throw new Error("No autorizado");

  return session;
}
