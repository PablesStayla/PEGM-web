import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetEnvCache } from './env';

/**
 * Unit tests for analytics utilities.
 * We test the pure helper functions and session ID generation.
 * Network calls are fully mocked.
 */

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('trackServerEvent', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetEnvCache();
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
  });

  afterEach(() => {
    Reflect.deleteProperty(process.env, 'AMPLITUDE_API_KEY');
    resetEnvCache();
  });

  it('does nothing when AMPLITUDE_API_KEY is not set', async () => {
    Reflect.deleteProperty(process.env, 'AMPLITUDE_API_KEY');
    const { trackServerEvent } = await import('./analytics');
    await trackServerEvent('purchase', { cart_value: 50_000 });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('calls Amplitude API when AMPLITUDE_API_KEY is set', async () => {
    process.env['AMPLITUDE_API_KEY'] = 'test-amp-key';
    const { trackServerEvent } = await import('./analytics');
    await trackServerEvent('purchase', { cart_value: 50_000, user_id: 'u-001' });
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.amplitude.com/2/httpapi',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('includes correct event_type and event_properties in payload', async () => {
    process.env['AMPLITUDE_API_KEY'] = 'test-amp-key';
    const { trackServerEvent } = await import('./analytics');
    await trackServerEvent('add_to_cart', { product_id: 'p-001', product_price: 25_000 });

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(callBody.events[0].event_type).toBe('add_to_cart');
    expect(callBody.events[0].event_properties.product_id).toBe('p-001');
    expect(callBody.api_key).toBe('test-amp-key');
  });

  it('does not throw when Amplitude request fails', async () => {
    process.env['AMPLITUDE_API_KEY'] = 'test-amp-key';
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const { trackServerEvent } = await import('./analytics');
    await expect(trackServerEvent('purchase', {})).resolves.toBeUndefined();
  });

  it('does not throw when Amplitude returns non-ok status', async () => {
    process.env['AMPLITUDE_API_KEY'] = 'test-amp-key';
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });
    const { trackServerEvent } = await import('./analytics');
    await expect(trackServerEvent('purchase', {})).resolves.toBeUndefined();
  });
});
