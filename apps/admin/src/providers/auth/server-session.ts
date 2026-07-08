/**
 * Server-side Auth Adapter — implements `AuthProvider` on top of
 * `@pranakaia/infrastructure/auth/server` (Supabase Auth + dev bypass).
 *
 * Use exclusively from Server Components, Route Handlers, server actions,
 * and middleware. NEVER import this from client components — `next/headers`
 * is server-only.
 *
 * @module providers/auth/server-session
 */

import 'server-only';
import {
  getCurrentUser,
  isAdmin,
  requireAdmin as requireAdminUser,
} from '@pranakaia/infrastructure/auth';
import { AuthenticationError, UnauthorizedError } from '@pranakaia/shared-kernel';
import { AdminUIError } from '@/providers/data';
import { type AuthProvider, type SessionUser, toSessionUser } from './auth-provider';

export const serverAuthProvider: AuthProvider = {
  async getSession(): Promise<SessionUser | null> {
    const user = await getCurrentUser();
    return user ? toSessionUser(user) : null;
  },

  async requireSession(): Promise<SessionUser> {
    const user = await getCurrentUser();
    if (!user) {
      throw new AdminUIError(new AuthenticationError());
    }
    return toSessionUser(user);
  },

  async requireAdmin(): Promise<SessionUser> {
    try {
      const user = await requireAdminUser();
      return toSessionUser(user);
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('Forbidden')) {
        throw new AdminUIError(new UnauthorizedError(e.message));
      }
      if (e instanceof Error && e.message.startsWith('Unauthorized')) {
        throw new AdminUIError(new AuthenticationError(e.message));
      }
      throw new AdminUIError(e instanceof Error ? e : String(e));
    }
  },

  async isAuthenticated(): Promise<boolean> {
    return isAdmin();
  },
};

/** Convenience re-export so RSC can do `getServerSession()` à la NextAuth. */
export const getServerSession = () => serverAuthProvider.getSession();
