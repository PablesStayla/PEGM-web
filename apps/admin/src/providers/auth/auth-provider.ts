/**
 * Auth Provider Port.
 *
 * UI components NEVER import `@pranakaia/infrastructure/auth` directly.
 * They consume this Port. If we ever switch from Supabase Auth to a custom
 * Better-Auth-only stack, only the adapter changes.
 *
 * Inspired by Refine's `authProvider` shape (`login`, `logout`, `check`,
 * `getIdentity`, `onError`) but adapted for Server Components: we do not
 * implement client-side `login()` here — that lives in the (auth) route
 * group. The Port exposes session helpers, and the auth adapter wraps
 * `@pranakaia/infrastructure/auth/server`.
 *
 * @module providers/auth/auth-provider
 */

import type { User } from '@supabase/supabase-js';

export type AdminRole = 'superadmin' | 'admin' | 'operator' | 'finance' | 'viewer';

export interface SessionUser {
  readonly id: string;
  readonly email: string;
  readonly role: AdminRole;
  /** Raw Supabase user metadata. Useful for audit logs. */
  readonly metadata: Record<string, unknown>;
}

export interface AuthProvider {
  /** Returns the current session user or `null` when anonymous. */
  getSession(): Promise<SessionUser | null>;
  /** Returns the session user, or **throws** `AdminUIError` if absent. */
  requireSession(): Promise<SessionUser>;
  /** Returns the session user, or **throws** if not an admin/superadmin. */
  requireAdmin(): Promise<SessionUser>;
  /** Cheap boolean check for layouts and UI gates. */
  isAuthenticated(): Promise<boolean>;
}

/** Internal: maps a raw Supabase user to our normalised `SessionUser`. */
export function toSessionUser(user: User): SessionUser {
  const rawRole = user.user_metadata?.['role'];
  const role = normaliseRole(typeof rawRole === 'string' ? rawRole : 'viewer');
  return {
    id: user.id,
    email: user.email ?? '',
    role,
    metadata: user.user_metadata ?? {},
  };
}

const ROLE_ALIASES: Record<string, AdminRole> = {
  super_admin: 'superadmin',
  superadmin: 'superadmin',
  SUPER_ADMIN: 'superadmin',
  owner: 'superadmin',
  admin: 'admin',
  ADMIN: 'admin',
  operator: 'operator',
  finance: 'finance',
  viewer: 'viewer',
};

function normaliseRole(raw: string): AdminRole {
  return ROLE_ALIASES[raw] ?? ROLE_ALIASES[raw.toLowerCase()] ?? 'viewer';
}
