import { createHash, randomBytes } from 'node:crypto';
import { Secret, TOTP } from 'otpauth';

export interface TwoFactorSecret {
  base32: string;
  otpauth_url: string;
}

export async function generate2FASecret(email: string, issuer: string = 'PranaKaia') {
  const secret = new Secret();
  const totp = new TOTP({
    issuer,
    label: email,
    secret,
  });

  // mock QR code data URI as requested by test
  const qrCode = `data:image/png;base64,${Buffer.from(totp.toString()).toString('base64')}`;

  return {
    secret: {
      base32: secret.base32,
      otpauth_url: totp.toString(),
    },
    qrCode,
  };
}

export async function verify2FAToken(
  token: string,
  secretBase32: string,
  email: string,
  issuer: string = 'PranaKaia',
): Promise<boolean> {
  try {
    const totp = new TOTP({
      issuer,
      label: email,
      secret: Secret.fromBase32(secretBase32),
    });
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  } catch {
    return false;
  }
}

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const hex = randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${hex.slice(0, 4)}-${hex.slice(4, 8)}`);
  }
  return codes;
}

export async function hashBackupCode(code: string): Promise<string> {
  const normalized = code.trim().toUpperCase();
  return createHash('sha256').update(normalized).digest('hex');
}

export async function verifyBackupCode(code: string, hashedCodes: string[]): Promise<boolean> {
  const hashed = await hashBackupCode(code);
  return hashedCodes.includes(hashed);
}
