/**
 * Public surface of the Auth Provider layer.
 *
 *   import { serverAuthProvider, getServerSession, type SessionUser } from '@/providers/auth';
 */

export type { AdminRole, AuthProvider, SessionUser } from './auth-provider';
export { toSessionUser } from './auth-provider';
export { getServerSession, serverAuthProvider } from './server-session';
