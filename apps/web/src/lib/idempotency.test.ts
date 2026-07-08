import { beforeEach, describe, expect, it, vi } from 'vitest';

const headersMock = vi.hoisted(() => vi.fn());
const redisSetMock = vi.hoisted(() => vi.fn());
const redisGetMock = vi.hoisted(() => vi.fn());
const redisDelMock = vi.hoisted(() => vi.fn());

vi.mock('next/headers', () => ({
  headers: headersMock,
}));

/**
 * Unit tests for idempotency utilities.
 * Integration tests for handleIdempotentRequest are in tests/integration/.
 */
vi.mock('../redis/client', () => ({
  redis: {
    set: redisSetMock,
    get: redisGetMock,
    del: redisDelMock,
  },
}));

vi.mock('../logger', () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

import { generateIdempotencyKey, handleIdempotentRequest } from './idempotency';

beforeEach(() => {
  vi.clearAllMocks();
  headersMock.mockResolvedValue(new Headers());
  redisSetMock.mockResolvedValue('OK');
  redisGetMock.mockResolvedValue(null);
  redisDelMock.mockResolvedValue(1);
});

describe('generateIdempotencyKey', () => {
  it('returns a non-empty string', () => {
    const key = generateIdempotencyKey();
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(0);
  });

  it('returns unique keys on each call', () => {
    const keys = Array.from({ length: 100 }, () => generateIdempotencyKey());
    const unique = new Set(keys);
    expect(unique.size).toBe(100);
  });

  it('key starts with "idem_" prefix', () => {
    const key = generateIdempotencyKey();
    expect(key.startsWith('idem_')).toBe(true);
  });

  it('key contains a UUID-like component', () => {
    const key = generateIdempotencyKey();
    // Should contain hex chars and dashes from UUID
    const uuidPart = key.replace('idem_', '');
    expect(uuidPart).toMatch(/[0-9a-f-]+/);
  });

  it('usa randomUUID cuando estÃ¡ disponible', () => {
    const originalCrypto = globalThis.crypto;
    vi.stubGlobal('crypto', { randomUUID: () => 'abc-def' });

    const key = generateIdempotencyKey();
    expect(key).toBe('idem_abc-def');

    vi.stubGlobal('crypto', originalCrypto);
  });
});

describe('handleIdempotentRequest', () => {
  it('ejecuta el handler normalmente si no hay Idempotency-Key', async () => {
    headersMock.mockResolvedValue(new Headers());
    const handler = vi.fn().mockResolvedValue({ ok: true });

    const result = await handleIdempotentRequest(handler);

    expect(result).toEqual({ ok: true });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(redisSetMock).not.toHaveBeenCalled();
  });

  it('adquiere lock y persiste FINISHED cuando la key es nueva', async () => {
    headersMock.mockResolvedValue(new Headers([['idempotency-key', 'k1']]));
    redisSetMock.mockResolvedValueOnce('OK').mockResolvedValueOnce('OK');

    const handler = vi.fn().mockResolvedValue({ orderId: 'ord-1' });
    const result = await handleIdempotentRequest(handler);

    expect(result).toEqual({ orderId: 'ord-1' });
    expect(redisSetMock).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('retorna respuesta cacheada cuando existe estado FINISHED', async () => {
    headersMock.mockResolvedValue(new Headers([['idempotency-key', 'k-finished']]));
    redisSetMock.mockResolvedValueOnce(null);
    redisGetMock.mockResolvedValue({ state: 'FINISHED', response: { cached: true } });

    const handler = vi.fn().mockResolvedValue({ cached: false });
    const result = await handleIdempotentRequest(handler);

    expect(result).toEqual({ cached: true });
    expect(handler).not.toHaveBeenCalled();
  });

  it('lanza conflicto cuando existe estado PROCESSING', async () => {
    headersMock.mockResolvedValue(new Headers([['idempotency-key', 'k-processing']]));
    redisSetMock.mockResolvedValueOnce(null);
    redisGetMock.mockResolvedValue({ state: 'PROCESSING' });

    const handler = vi.fn().mockResolvedValue({ ok: true });

    await expect(handleIdempotentRequest(handler)).rejects.toThrow('IDEMPOTENCY_CONFLICT');
    expect(handler).not.toHaveBeenCalled();
  });

  it('libera lock cuando el handler falla', async () => {
    headersMock.mockResolvedValue(new Headers([['idempotency-key', 'k-error']]));
    redisSetMock.mockResolvedValueOnce('OK');

    const handler = vi.fn().mockRejectedValue(new Error('handler failure'));

    await expect(handleIdempotentRequest(handler)).rejects.toThrow('handler failure');
    expect(redisDelMock).toHaveBeenCalledWith('idem:k-error');
  });
});
