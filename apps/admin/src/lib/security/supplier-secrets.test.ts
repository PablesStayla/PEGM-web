import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockIsProduction = vi.hoisted(() => vi.fn(() => false));
const mockEnv = vi.hoisted(() => ({
  SUPPLIER_SECRETS_KEY: undefined as string | undefined,
  ADMIN_STEP_UP_SECRET: undefined as string | undefined,
}));

vi.mock('@/lib/env', () => ({
  env: mockEnv,
  isProduction: mockIsProduction,
}));

describe('supplier secrets crypto', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockIsProduction.mockReturnValue(false);
    mockEnv.SUPPLIER_SECRETS_KEY = undefined;
    mockEnv.ADMIN_STEP_UP_SECRET = undefined;
  });

  it('cifra y descifra correctamente con fallback local no productivo', async () => {
    const { decryptSupplierSecret, encryptSupplierSecret, isEncryptedSupplierSecret } =
      await import('./supplier-secrets');

    const encrypted = encryptSupplierSecret('super-secret-token');

    expect(isEncryptedSupplierSecret(encrypted)).toBe(true);
    expect(decryptSupplierSecret(encrypted)).toBe('super-secret-token');
  });

  it('no recifra valores ya cifrados y mantiene idempotencia', async () => {
    const { encryptSupplierSecret } = await import('./supplier-secrets');

    const encrypted = encryptSupplierSecret('token-1');
    const encryptedAgain = encryptSupplierSecret(encrypted);

    expect(encryptedAgain).toBe(encrypted);
  });

  it('exige key explícita en producción cuando no está configurada', async () => {
    mockIsProduction.mockReturnValue(true);

    const { encryptSupplierSecret } = await import('./supplier-secrets');

    expect(() => encryptSupplierSecret('prod-secret')).toThrow(
      'SUPPLIER_SECRETS_KEY is required in production.',
    );
  });
});
