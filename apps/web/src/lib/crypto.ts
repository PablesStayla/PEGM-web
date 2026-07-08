/**
 * @file apps/web/src/lib/crypto.ts
 *
 * AES-256-GCM symmetric encryption for storing sensitive values at rest
 * (e.g. supplier API keys, personal data fields in the DB).
 *
 * Output format: `<iv_hex>:<authTag_hex>:<ciphertext_hex>`
 *
 * ⚠️  CRITICAL: Never fall back to returning plaintext on encryption failure.
 *     A silent fallback would store secrets unencrypted without any warning.
 *     Both encrypt() and decrypt() throw on misconfiguration or key mismatch.
 *
 * Key requirements:
 * - ENCRYPTION_KEY must be exactly 32 bytes (256-bit) in hex (64 hex chars)
 *   OR as 32 UTF-8 bytes.
 * - Store it in Vercel env vars / .env.local, never commit it.
 */

import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from './env';
import { createLogger } from './logger';

const log = createLogger({ module: 'crypto' });

const ALGORITHM = 'aes-256-gcm' as const;
const IV_BYTES = 16;
const AUTH_TAG_BYTES = 16;
const EXPECTED_KEY_BYTES = 32;
const HEX_PARTS = 3; // iv:authTag:ciphertext

// ── Key derivation ────────────────────────────────────────────────────────────

let _key: Buffer | null = null;

function getKey(): Buffer {
  if (_key) {
    return _key;
  }

  const raw = env.ENCRYPTION_KEY;

  if (!raw) {
    throw new Error(
      'ENCRYPTION_KEY is not set. ' +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }

  // Accept either 64-char hex OR 32-byte UTF-8
  let key: Buffer;
  if (raw.length === 64 && /^[0-9a-fA-F]+$/.test(raw)) {
    key = Buffer.from(raw, 'hex');
  } else {
    key = Buffer.from(raw, 'utf8');
  }

  if (key.length !== EXPECTED_KEY_BYTES) {
    throw new Error(
      `ENCRYPTION_KEY must be exactly ${EXPECTED_KEY_BYTES} bytes. ` +
        `Got ${key.length} bytes. ` +
        'Provide a 64-character hex string or a 32-byte UTF-8 string.',
    );
  }

  _key = key;
  return _key;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Encrypt a plaintext string.
 * Returns a `iv:authTag:ciphertext` hex string.
 *
 * @throws {Error} If ENCRYPTION_KEY is missing or invalid.
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

  const authTag = cipher.getAuthTag();

  log.debug('Value encrypted', { plaintextLength: plaintext.length });

  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

/**
 * Decrypt a string produced by `encrypt()`.
 *
 * @throws {Error} If the value is tampered, key is wrong, or format is invalid.
 */
export function decrypt(encryptedValue: string): string {
  const key = getKey();
  const parts = encryptedValue.split(':');

  if (parts.length !== HEX_PARTS) {
    throw new Error(
      `Invalid encrypted value format. Expected ${HEX_PARTS} colon-separated hex parts, ` +
        `got ${parts.length}. Was this value encrypted with encrypt()?`,
    );
  }

  const [ivHex, authTagHex, ciphertextHex] = parts as [string, string, string];

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  if (iv.length !== IV_BYTES) {
    throw new Error(`IV must be ${IV_BYTES} bytes, got ${iv.length}.`);
  }

  if (authTag.length !== AUTH_TAG_BYTES) {
    throw new Error(`Auth tag must be ${AUTH_TAG_BYTES} bytes, got ${authTag.length}.`);
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  log.debug('Value decrypted', { decryptedLength: decrypted.length });

  return decrypted.toString('utf8');
}

/**
 * Returns true if the string was produced by `encrypt()` (has the expected format).
 * Does NOT verify authenticity — call `decrypt()` to do that.
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':');
  return parts.length === HEX_PARTS && parts.every((p) => p.length > 0 && /^[0-9a-fA-F]+$/.test(p));
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Use this when comparing tokens, API keys, or HMAC digests.
 */
export function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/** Flush the key cache (test utility only). */
export function _resetKeyCache(): void {
  _key = null;
}
