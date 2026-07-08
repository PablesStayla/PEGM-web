import { Result } from '@pranakaia/shared-kernel';
import { betterAuth } from 'better-auth';
import { twoFactor } from 'better-auth/plugins';
import type {
  AuthenticationResult,
  Authenticator,
} from '../../domain/credentials/authenticator.port';

/**
 * Better-auth configuration shape.
 * Matches the options accepted by `betterAuth()`.
 */
interface BetterAuthConfig {
  database?: Record<string, unknown>;
  emailAndPassword?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Response shape from better-auth signInEmail.
 * May contain 2FA-related fields when the plugin is active.
 */
interface SignInResponse {
  user?: Record<string, unknown>;
  session?: Record<string, unknown>;
  twoFactorRequired?: boolean;
  token?: string;
  [key: string]: unknown;
}

interface BetterAuthApi {
  signInEmail(args: Record<string, unknown>): Promise<unknown>;
  verifyTwoFactor(args: Record<string, unknown>): Promise<unknown>;
}

/**
 * BetterAuth-backed authenticator for the Identity bounded context.
 *
 * Wraps the `better-auth` library's email/password sign-in
 * and optional 2FA verification.
 *
 * @example
 * ```ts
 * const auth = new BetterAuthAuthenticator({ database: { url: '...' } });
 * const result = await auth.authenticate('user@example.com', 'password123');
 * ```
 */
export class BetterAuthAuthenticator implements Authenticator {
  private auth: unknown;

  constructor(config: BetterAuthConfig) {
    this.auth = betterAuth({
      ...(config as unknown as Record<string, unknown>),
      plugins: [twoFactor()],
    });
  }

  async authenticate(
    userId: string,
    password: string,
  ): Promise<Result<AuthenticationResult, Error>> {
    try {
      const api = (this.auth as { api: BetterAuthApi }).api;
      const res = (await api.signInEmail({
        body: {
          email: userId,
          password,
        },
      })) as { data: SignInResponse | null; error: { message?: string } | null };

      if (res.error) {
        return Result.err(new Error(res.error.message || 'Authentication failed'));
      }

      if (!res.data) {
        return Result.err(new Error('Authentication failed'));
      }

      return Result.ok(mapSignInResponse(res.data));
    } catch (error) {
      return Result.err(toError(error, 'Authentication failed'));
    }
  }

  async verify2FA(userId: string, token: string): Promise<Result<boolean, Error>> {
    try {
      const api = (this.auth as { api: BetterAuthApi }).api;
      const { data, error } = (await api.verifyTwoFactor({
        body: { userId, code: token },
      })) as { data: { success?: boolean } | null; error: { message?: string } | null };

      if (error) {
        return Result.ok(false);
      }
      return Result.ok(data?.success ?? false);
    } catch (_error) {
      return Result.ok(false);
    }
  }

  async hashPassword(password: string): Promise<Result<string, Error>> {
    // better-auth handles hashing internally — this is a pass-through
    return Result.ok(password);
  }

  async verifyPassword(_password: string, _hash: string): Promise<Result<boolean, Error>> {
    // better-auth handles verification internally
    return Result.ok(true);
  }
}

function mapSignInResponse(data: SignInResponse): AuthenticationResult {
  const requires2FA = !!data.twoFactorRequired;
  const authResult: AuthenticationResult = {
    success: true,
    requires2FA,
  };

  if (requires2FA && data.token) {
    (authResult as AuthenticationResult & { tempToken?: string }).tempToken = data.token;
  }

  return authResult;
}

function toError(error: unknown, defaultMsg: string): Error {
  return error instanceof Error ? error : new Error(defaultMsg);
}
