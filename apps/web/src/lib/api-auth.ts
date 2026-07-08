/**
 * @file apps/web/src/lib/api-auth.ts
 *
 * Authentication guards for API route handlers.
 *
 * Uses the @pranakaia/auth server utilities backed by Supabase.
 * Returns RFC 7807 error responses on failure (consistent with the rest
 * of the API layer).
 *
 * Usage:
 *   export async function GET(request: NextRequest) {
 *     const auth = await withAuth();
 *     if (!auth.authenticated) return auth.response;
 *     // auth.user is typed and safe to use
 *   }
 */

import { getCurrentUser } from '@pranakaia/auth/server';
import { NextResponse } from 'next/server';
import { createLogger } from './logger';

const log = createLogger({ module: 'api-auth' });

// ── Types ────────────────────────────────────────────────────────────────────

type UserRole = 'customer' | 'admin' | 'super_admin' | 'supplier';

interface AuthenticatedUser {
  id: string;
  email: string | null;
  role: UserRole;
}

type AuthResult =
  | { authenticated: true; user: AuthenticatedUser }
  | { authenticated: false; response: NextResponse };

// ── RFC 7807 helpers ────────────────────────────────────────────────────────────

function problem(status: 401 | 403, title: string, detail: string): NextResponse {
  return NextResponse.json(
    {
      type: `https://pranakaia.com/errors/${status === 401 ? 'unauthorized' : 'forbidden'}`,
      title,
      status,
      detail,
    },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

// ── Guards ─────────────────────────────────────────────────────────────────────

/**
 * Require any authenticated user.
 * Returns the user if the session is valid, or a 401 response otherwise.
 */
async function withAuth(): Promise<AuthResult> {
  const user = await getCurrentUser();

  if (!user) {
    log.warn('Unauthenticated API request');
    return {
      authenticated: false,
      response: problem(
        401,
        'Unauthorized',
        'A valid session is required to access this resource.',
      ),
    };
  }

  const role = (user.user_metadata?.['role'] as string | undefined)?.toLowerCase();

  log.debug('Authenticated API request', { userId: user.id, role });

  return {
    authenticated: true,
    user: {
      id: user.id,
      email: user.email ?? null,
      role: (role ?? 'customer') as UserRole,
    },
  };
}

/**
 * Require an admin or super_admin role.
 * Returns the user if authorised, or a 401/403 response otherwise.
 */
export async function withAdmin(): Promise<AuthResult> {
  const result = await withAuth();
  if (!result.authenticated) {
    return result;
  }

  const { role } = result.user;
  const isAdmin = role === 'admin' || role === 'super_admin';

  if (!isAdmin) {
    log.warn('Forbidden API request (insufficient role)', {
      userId: result.user.id,
      role,
    });
    return {
      authenticated: false,
      response: problem(
        403,
        'Forbidden',
        'You do not have the required permissions to access this resource.',
      ),
    };
  }

  return result;
}

/**
 * Require a supplier role (or above).
 */
export async function withSupplier(): Promise<AuthResult> {
  const result = await withAuth();
  if (!result.authenticated) {
    return result;
  }

  const { role } = result.user;
  const isAllowed = role === 'supplier' || role === 'admin' || role === 'super_admin';

  if (!isAllowed) {
    log.warn('Forbidden supplier API request', { userId: result.user.id, role });
    return {
      authenticated: false,
      response: problem(403, 'Forbidden', 'Supplier access is required to perform this action.'),
    };
  }

  return result;
}
