import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Unit tests for the useCsrf hook.
 */

vi.mock('@/lib/security/csrf', () => ({
  generateCsrfToken: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

import { generateCsrfToken } from '@/lib/security/csrf';
import { useCsrf } from './use-csrf';

const mockGenerateCsrfToken = vi.mocked(generateCsrfToken);

describe('useCsrf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in loading state with an empty token', () => {
    mockGenerateCsrfToken.mockImplementation(() => new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useCsrf());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.token).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('sets token and clears loading when token generates successfully', async () => {
    mockGenerateCsrfToken.mockResolvedValueOnce('csrf-token-abc123');
    const { result } = renderHook(() => useCsrf());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.token).toBe('csrf-token-abc123');
    expect(result.current.error).toBeNull();
  });

  it('exposes an error and clears loading when generation fails', async () => {
    mockGenerateCsrfToken.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useCsrf());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.token).toBe('');
  });

  it('refresh() regenerates the token', async () => {
    mockGenerateCsrfToken
      .mockResolvedValueOnce('first-token')
      .mockResolvedValueOnce('second-token');

    const { result } = renderHook(() => useCsrf());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.token).toBe('first-token');

    await act(async () => {
      await result.current.refresh();
    });
    await waitFor(() => expect(result.current.token).toBe('second-token'));
  });

  it('refresh() exposes error when regeneration fails', async () => {
    mockGenerateCsrfToken
      .mockResolvedValueOnce('first-token')
      .mockRejectedValueOnce(new Error('Timeout'));

    const { result } = renderHook(() => useCsrf());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });
    await waitFor(() => expect(result.current.error?.message).toBe('Timeout'));
  });
});
