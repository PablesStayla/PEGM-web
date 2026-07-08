import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  generateBackupCodes,
  hashBackupCode,
  verify2FAToken,
  verifyBackupCode,
} from '@pranakaia/infrastructure/auth';
import { users } from '@pranakaia/infrastructure/db';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { env, isProduction } from '@/lib/env';

const STEP_UP_COOKIE_NAME = 'pk-admin-step-up';
const STEP_UP_TTL_SECONDS = 10 * 60;
let cachedLocalSigningSecret: string | null = null;

type StoredMfaState = {
  enabled: boolean;
  secret: string;
  backupCodes: string[];
  enrolledAt: string;
  lastVerifiedAt?: string | undefined;
  lastStepUpAt?: string | undefined;
};

type UserMetadataShape = {
  security?:
    | {
        mfa?: StoredMfaState | undefined;
      }
    | undefined;
  [key: string]: unknown;
};

type AdminMfaSummary = {
  email: string;
  mfaEnabled: boolean;
  enrolledAt: string | null;
  backupCodesRemaining: number;
  stepUpActive: boolean;
};

function getLocalSigningSecret() {
  if (cachedLocalSigningSecret) {
    return cachedLocalSigningSecret;
  }

  // Non-production fallback is host-scoped to avoid a shared predictable secret.
  const hostSeed = [
    process.cwd(),
    process.env['USERNAME'] ?? process.env['USER'] ?? 'unknown-user',
    process.env['COMPUTERNAME'] ?? process.env['HOSTNAME'] ?? 'unknown-host',
  ].join('|');

  cachedLocalSigningSecret = createHash('sha256').update(`admin-step-up:${hostSeed}`).digest('hex');
  return cachedLocalSigningSecret;
}

function getSigningSecret() {
  const configuredSecret = env.ADMIN_STEP_UP_SECRET;
  if (configuredSecret) {
    return configuredSecret;
  }

  if (!isProduction()) {
    return getLocalSigningSecret();
  }

  throw new Error('ADMIN_STEP_UP_SECRET is required in production');
}

function parseUserMetadata(metadata: unknown): UserMetadataShape {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }

  return metadata as UserMetadataShape;
}

function getStoredMfaState(metadata: unknown): StoredMfaState | null {
  const parsedMetadata = parseUserMetadata(metadata);
  const mfa = parsedMetadata.security?.mfa;

  if (!mfa?.enabled || !mfa.secret) {
    return null;
  }

  return {
    enabled: true,
    secret: mfa.secret,
    backupCodes: Array.isArray(mfa.backupCodes) ? mfa.backupCodes : [],
    enrolledAt: mfa.enrolledAt,
    lastVerifiedAt: mfa.lastVerifiedAt,
    lastStepUpAt: mfa.lastStepUpAt,
  };
}

function setStoredMfaState(metadata: unknown, mfaState: StoredMfaState | null): UserMetadataShape {
  const parsedMetadata = parseUserMetadata(metadata);
  const nextSecurity = { ...(parsedMetadata.security ?? {}) };

  if (!mfaState) {
    nextSecurity.mfa = undefined;
  } else {
    nextSecurity.mfa = mfaState;
  }

  return {
    ...parsedMetadata,
    security: nextSecurity,
  };
}

function signValue(value: string): string {
  return createHmac('sha256', getSigningSecret()).update(value).digest('hex');
}

function createSignedCookieValue(payload: string) {
  const encodedPayload = Buffer.from(payload, 'utf8').toString('base64url');
  const signature = signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function decodeSignedCookieValue(value: string) {
  const [encodedPayload, signature] = value.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);
  const signatureBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    return Buffer.from(encodedPayload, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}

async function persistMfaState(userId: string, metadata: unknown, mfaState: StoredMfaState | null) {
  await db
    .update(users)
    .set({
      metadata: setStoredMfaState(metadata, mfaState),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

async function getAdminMfaRecord(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      metadata: users.metadata,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error('Admin user not found');
  }

  return {
    ...user,
    mfa: getStoredMfaState(user.metadata),
  };
}

export async function getAdminMfaSummary(userId: string): Promise<AdminMfaSummary> {
  const user = await getAdminMfaRecord(userId);

  return {
    email: user.email,
    mfaEnabled: Boolean(user.mfa?.enabled),
    enrolledAt: user.mfa?.enrolledAt ?? null,
    backupCodesRemaining: user.mfa?.backupCodes.length ?? 0,
    stepUpActive: await hasValidAdminStepUpSession(userId),
  };
}

export async function enableAdminMfaForUser(params: {
  userId: string;
  email: string;
  secret: string;
  token: string;
}) {
  const { userId, email, secret, token } = params;
  const user = await getAdminMfaRecord(userId);

  if (!verify2FAToken(token, secret, email)) {
    throw new Error('Código TOTP inválido');
  }

  const backupCodes = generateBackupCodes(10);
  const hashedBackupCodes = await Promise.all(
    backupCodes.map((code: string) => hashBackupCode(code)),
  );
  const now = new Date().toISOString();

  await persistMfaState(userId, user.metadata, {
    enabled: true,
    secret,
    backupCodes: hashedBackupCodes,
    enrolledAt: now,
    lastVerifiedAt: now,
    lastStepUpAt: now,
  });

  return {
    backupCodes,
    summary: await getAdminMfaSummary(userId),
  };
}

export async function disableAdminMfaForUser(userId: string) {
  const user = await getAdminMfaRecord(userId);
  await persistMfaState(userId, user.metadata, null);
  await clearAdminStepUpSession();
}

export async function verifyAdminMfaChallenge(params: { userId: string; code: string }) {
  const { userId, code } = params;
  const user = await getAdminMfaRecord(userId);

  if (!user.mfa) {
    throw new Error('MFA no está configurado para este usuario');
  }

  const normalizedCode = code.trim().toUpperCase();
  const usedBackupCode = await verifyBackupCode(normalizedCode, user.mfa.backupCodes);
  const isTotpValid = verify2FAToken(normalizedCode, user.mfa.secret, user.email);

  if (!usedBackupCode && !isTotpValid) {
    return {
      valid: false,
      method: null,
      backupCodesRemaining: user.mfa.backupCodes.length,
    };
  }

  const now = new Date().toISOString();
  let nextBackupCodes = user.mfa.backupCodes;

  if (usedBackupCode) {
    const usedHash = await hashBackupCode(normalizedCode);
    nextBackupCodes = user.mfa.backupCodes.filter((hash: string) => hash !== usedHash);
  }

  await persistMfaState(userId, user.metadata, {
    ...user.mfa,
    backupCodes: nextBackupCodes,
    lastVerifiedAt: now,
    lastStepUpAt: now,
  });

  return {
    valid: true,
    method: usedBackupCode ? 'backup_code' : 'totp',
    backupCodesRemaining: nextBackupCodes.length,
  };
}

export async function issueAdminStepUpSession(userId: string) {
  const expiresAt = Date.now() + STEP_UP_TTL_SECONDS * 1000;
  const nonce = randomBytes(8).toString('hex');
  const payload = JSON.stringify({ userId, expiresAt, nonce });
  const cookieStore = await cookies();

  cookieStore.set(STEP_UP_COOKIE_NAME, createSignedCookieValue(payload), {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction(),
    path: '/',
    maxAge: STEP_UP_TTL_SECONDS,
  });

  return {
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

async function clearAdminStepUpSession() {
  const cookieStore = await cookies();
  cookieStore.delete(STEP_UP_COOKIE_NAME);
}

async function hasValidAdminStepUpSession(userId: string) {
  const cookieStore = await cookies();
  const signedValue = cookieStore.get(STEP_UP_COOKIE_NAME)?.value;
  if (!signedValue) {
    return false;
  }

  const decodedPayload = decodeSignedCookieValue(signedValue);
  if (!decodedPayload) {
    return false;
  }

  try {
    const parsed = JSON.parse(decodedPayload) as { userId?: string; expiresAt?: number };
    return (
      parsed.userId === userId &&
      typeof parsed.expiresAt === 'number' &&
      parsed.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

export async function requireRecentAdminStepUp(userId: string) {
  const hasValidStepUp = await hasValidAdminStepUpSession(userId);
  if (!hasValidStepUp) {
    throw new Error('STEP_UP_REQUIRED');
  }
}
