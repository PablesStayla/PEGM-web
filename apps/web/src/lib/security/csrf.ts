/**
 * @file apps/web/src/lib/security/csrf.ts
 *
 * CSRF protection using the Double-Submit Cookie pattern.
 *
 * Flow:
 * 1. Server calls generateCsrfToken() → signs a token, stores in httpOnly cookie
 * 2. Client reads the token value and sends it in the X-CSRF-Token header
 * 3. Server calls verifyCsrfToken(headerToken) → verifies signature + expiry + match
 *
 * Security properties:
 * - HMAC-SHA256 signature prevents forgery even if token value is known
 * - timingSafeEqual prevents timing side-channel attacks on signature comparison
 * - httpOnly cookie prevents XSS-based token theft
 * - sameSite: 'strict' prevents cross-site request submission
 *
 * ⚠️  CSRF_SECRET must be set in production. There is intentionally NO fallback.
 *     Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { env } from '@/lib/env';
import { createLogger } from '@/lib/logger';

const log = createLogger({ module: 'security:csrf' });

const CSRF_TOKEN_NAME = 'pk_csrf_token';
const TOKEN_EXPIRY_MS = 1_000 * 60 * 60; // 1 hour

// ── Secret key ─────────────────────────────────────────────────────────────

let _secret: string | null = null;

function getCsrfSecret(): string {
  if (_secret) {
    return _secret;
  }

  const secret = env.CSRF_SECRET;
  if (!secret) {
    throw new Error(
      'CSRF_SECRET environment variable is not set. ' +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }
  if (secret.length < 32) {
    throw new Error('CSRF_SECRET must be at least 32 characters long.');
  }

  _secret = secret;
  return _secret;
}

/** Test utility only — flush the secret cache between tests. */
export function _resetCsrfSecretCache(): void {
  _secret = null;
}

// ── Token shape ─────────────────────────────────────────────────────────────

interface CsrfTokenPayload {
  value: string;
  expiresAt: number;
}

function sign(payload: CsrfTokenPayload): string {
  const secret = getCsrfSecret();
  const data = JSON.stringify(payload);
  const encoded = Buffer.from(data).toString('base64');
  const signature = createHmac('sha256', secret).update(data).digest('hex');
  return `${encoded}.${signature}`;
}

function verify(signed: string): CsrfTokenPayload | null {
  const dotIdx = signed.lastIndexOf('.');
  if (dotIdx === -1) {
    return null;
  }

  const encoded = signed.slice(0, dotIdx);
  const receivedSig = signed.slice(dotIdx + 1);

  let payload: CsrfTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) as CsrfTokenPayload;
  } catch {
    return null;
  }

  const secret = getCsrfSecret();
  const expectedSig = createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

  // timingSafeEqual requires same-length buffers
  const a = Buffer.from(receivedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length) {
    return null;
  }

  if (!timingSafeEqual(a, b)) {
    return null;
  }
  return payload;
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate a new CSRF token, store it in an httpOnly cookie, and return
 * the raw token value to be included in subsequent requests.
 */
export async function generateCsrfToken(): Promise<string> {
  const value = randomBytes(32).toString('hex');
  const payload: CsrfTokenPayload = { value, expiresAt: Date.now() + TOKEN_EXPIRY_MS };
  const signed = sign(payload);

  (await cookies()).set(CSRF_TOKEN_NAME, signed, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY_MS / 1_000,
    path: '/',
  });

  log.debug('CSRF token generated');
  return value;
}

/**
 * Verify that `token` matches the signed cookie.
 * Returns true only if the signature is valid and the token is not expired.
 */
export async function verifyCsrfToken(token: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const signed = cookieStore.get(CSRF_TOKEN_NAME)?.value;
    if (!signed) {
      log.warn('CSRF verification failed: no cookie');
      return false;
    }

    const payload = verify(signed);
    if (!payload) {
      log.warn('CSRF verification failed: invalid signature');
      return false;
    }

    if (Date.now() > payload.expiresAt) {
      log.warn('CSRF verification failed: token expired');
      return false;
    }

    // Constant-time comparison of the token values
    const a = Buffer.from(token);
    const b = Buffer.from(payload.value);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      log.warn('CSRF verification failed: token mismatch');
      return false;
    }

    return true;
  } catch (error) {
    log.error('CSRF verification threw unexpectedly', {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Read the CSRF token from the X-CSRF-Token (or X-Csrf-Token) header.
 */
async function getCsrfTokenFromHeaders(): Promise<string | null> {
  const h = await headers();
  return h.get('x-csrf-token') ?? h.get('X-CSRF-Token') ?? null;
}

/**
 * Guard for Server Actions and API handlers.
 * Throws if the token is missing or invalid.
 */
export async function protectCsrf(): Promise<void> {
  const token = await getCsrfTokenFromHeaders();
  if (!token) {
    throw new Error('CSRF token missing from request headers.');
  }

  const valid = await verifyCsrfToken(token);
  if (!valid) {
    throw new Error('CSRF token is invalid or expired.');
  }
}

/**
 * Read the current token value from the cookie (without generating a new one).
 * Generates a fresh token if the cookie is absent or expired.
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const signed = cookieStore.get(CSRF_TOKEN_NAME)?.value;

  if (signed) {
    const payload = verify(signed);
    if (payload && Date.now() < payload.expiresAt) {
      return payload.value;
    }
  }

  return generateCsrfToken();
}
