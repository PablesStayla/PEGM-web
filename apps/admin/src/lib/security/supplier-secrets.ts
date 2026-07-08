import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { env, isProduction } from '@/lib/env';

const ALGORITHM = 'aes-256-gcm';
const IV_SIZE_BYTES = 12;
const AUTH_TAG_SIZE_BYTES = 16;
const SECRET_PREFIX = 'enc:v1:';

let cachedKey: Buffer | null = null;

function getLocalSecretsSeed() {
  return [
    process.cwd(),
    process.env['USERNAME'] ?? process.env['USER'] ?? 'unknown-user',
    process.env['COMPUTERNAME'] ?? process.env['HOSTNAME'] ?? 'unknown-host',
  ].join('|');
}

function getSupplierSecretsKey(): Buffer {
  if (cachedKey) {
    return cachedKey;
  }

  const configured = env.SUPPLIER_SECRETS_KEY ?? env.ADMIN_STEP_UP_SECRET;

  if (!configured) {
    if (isProduction()) {
      throw new Error('SUPPLIER_SECRETS_KEY is required in production.');
    }

    // Non-production fallback is host-scoped to avoid a shared predictable secret.
    cachedKey = createHash('sha256').update(`supplier-secrets:${getLocalSecretsSeed()}`).digest();
    return cachedKey;
  }

  cachedKey = createHash('sha256').update(configured).digest();
  return cachedKey;
}

export function isEncryptedSupplierSecret(value: string): boolean {
  return value.startsWith(SECRET_PREFIX);
}

export function encryptSupplierSecret(plaintext: string): string {
  if (!plaintext) {
    return '';
  }

  if (isEncryptedSupplierSecret(plaintext)) {
    return plaintext;
  }

  const key = getSupplierSecretsKey();
  const iv = randomBytes(IV_SIZE_BYTES);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${SECRET_PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptSupplierSecret(value: string): string {
  if (!value) {
    return '';
  }

  if (!isEncryptedSupplierSecret(value)) {
    return value;
  }

  const raw = value.slice(SECRET_PREFIX.length);
  const [ivHex, authTagHex, encryptedHex] = raw.split(':');

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Invalid encrypted supplier secret format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  if (iv.byteLength !== IV_SIZE_BYTES || authTag.byteLength !== AUTH_TAG_SIZE_BYTES) {
    throw new Error('Invalid encrypted supplier secret payload');
  }

  const key = getSupplierSecretsKey();
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
