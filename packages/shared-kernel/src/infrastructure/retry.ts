/**
 * Retry utility with exponential backoff.
 */

export interface RetryConfig {
  maxAttempts?: number;
  delay?: number;
  factor?: number;
  maxDelayMs?: number;
  isRetriable?: (error: Error) => boolean;
}

export interface RetryOptions extends RetryConfig {
  baseDelayMs?: number;
}

const DEFAULT_CONFIG: Required<
  Pick<RetryConfig, 'maxAttempts' | 'delay' | 'factor' | 'maxDelayMs'>
> & {
  isRetriable: (error: Error) => boolean;
} = {
  maxAttempts: 3,
  delay: 1000,
  factor: 2,
  maxDelayMs: 10_000,
  isRetriable: () => true,
};

interface RetryState {
  attempt: number;
  currentDelay: number;
  lastError?: Error;
}

export async function retry<T>(fn: () => Promise<T>, config?: RetryConfig): Promise<T> {
  const options = { ...DEFAULT_CONFIG, ...config };
  const state: RetryState = { attempt: 0, currentDelay: options.delay };

  while (state.attempt < options.maxAttempts) {
    state.attempt++;
    const res = await tryOnce(fn, state, options);
    if (res.success) {
      return res.value!;
    }
  }

  throw state.lastError ?? new Error('Retry failed');
}

async function tryOnce<T>(
  fn: () => Promise<T>,
  state: RetryState,
  options: typeof DEFAULT_CONFIG,
): Promise<{ success: boolean; value?: T }> {
  try {
    const value = await fn();
    return { success: true, value };
  } catch (error) {
    state.lastError = castToError(error);

    if (state.attempt < options.maxAttempts) {
      checkRetriable(state.lastError, options.isRetriable);
      await sleep(Math.max(0, state.currentDelay));
      state.currentDelay = Math.min(state.currentDelay * options.factor, options.maxDelayMs);
    }
    return { success: false };
  }
}

export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const config: RetryConfig = {
    ...(options.maxAttempts !== undefined ? { maxAttempts: options.maxAttempts } : {}),
    ...(options.baseDelayMs !== undefined
      ? { delay: options.baseDelayMs }
      : options.delay !== undefined
        ? { delay: options.delay }
        : {}),
    ...(options.factor !== undefined ? { factor: options.factor } : {}),
    ...(options.maxDelayMs !== undefined ? { maxDelayMs: options.maxDelayMs } : {}),
    ...(options.isRetriable !== undefined ? { isRetriable: options.isRetriable } : {}),
  };

  return retry(fn, config);
}

function castToError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function checkRetriable(error: Error, isRetriable: (error: Error) => boolean): void {
  if (!isRetriable(error)) {
    throw error;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
