'use client';

/**
 * @file apps/web/src/hooks/use-csrf.ts
 *
 * CSRF token hook for form protection.
 *
 * Generates a CSRF token on mount and exposes it for inclusion in
 * form submissions and API requests. Works with next-safe-action’s
 * built-in CSRF protection and with custom server-side validators.
 *
 * Usage:
 *   const { token, isLoading, error } = useCsrf();
 *   <input type="hidden" name="csrf_token" value={token} />
 */

import { useCallback, useEffect, useState } from 'react';
import { createLogger } from '@/lib/logger';
import { generateCsrfToken } from '@/lib/security/csrf';

const log = createLogger({ module: 'use-csrf' });

interface UseCsrfReturn {
  token: string;
  /** True while the initial token is being generated */
  isLoading: boolean;
  /** Non-null if token generation failed */
  error: Error | null;
  /** Manually refresh the token (e.g., after a 403 response) */
  refresh: () => Promise<void>;
}

export function useCsrf(): UseCsrfReturn {
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const csrfToken = await generateCsrfToken();
      setToken(csrfToken);
      log.debug('CSRF token generated successfully');
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err));
      setError(wrapped);
      // Log so developers see it — a missing CSRF token is a security issue
      log.error('Failed to generate CSRF token', { error: wrapped.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchToken();
  }, [fetchToken]);

  return { token, isLoading, error, refresh: fetchToken };
}
