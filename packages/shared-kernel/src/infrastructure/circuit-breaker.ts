/**
 * Circuit breaker with compatibility for legacy tests and current app code.
 */

export interface CircuitBreakerOptions {
  name?: string;
  failureThreshold?: number;
  successThreshold?: number;
  recoveryTimeMs?: number;
  timeoutMs?: number;
  timeout?: number;
}

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export class CircuitBreaker {
  private _state: CircuitState = CircuitState.CLOSED;
  private _failures = 0;
  private _successes = 0;
  private lastFailureTime: number | null = null;

  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly recoveryTimeMs: number;
  private readonly timeoutMs: number;

  constructor(options: CircuitBreakerOptions) {
    const {
      failureThreshold = 5,
      successThreshold = 1,
      recoveryTimeMs,
      timeoutMs,
      timeout = 30_000,
    } = options;

    this.failureThreshold = failureThreshold;
    this.successThreshold = successThreshold;
    this.recoveryTimeMs = recoveryTimeMs ?? timeout;
    this.timeoutMs = timeoutMs ?? timeout ?? 15_000;
  }

  get state(): CircuitState {
    if (this._state === CircuitState.OPEN) {
      this.tryRecover();
    }
    return this._state;
  }

  get failures(): number {
    return this._failures;
  }

  get currentState(): string {
    return this.state;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return this.call(fn);
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    const currentState = this.state;
    if (currentState === CircuitState.OPEN) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await this.executeWithTimeout(fn);
      this.handleSuccess();
      return result;
    } catch (error) {
      this.handleFailure();
      throw error;
    }
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${this.timeoutMs}ms`)), this.timeoutMs),
      ),
    ]);
  }

  reset(): void {
    this._state = CircuitState.CLOSED;
    this._failures = 0;
    this._successes = 0;
    this.lastFailureTime = null;
  }

  private tryRecover(): void {
    if (this._state !== CircuitState.OPEN || this.lastFailureTime === null) {
      return;
    }

    if (Date.now() - this.lastFailureTime >= this.recoveryTimeMs) {
      this._state = CircuitState.HALF_OPEN;
      this._successes = 0;
    }
  }

  private handleSuccess(): void {
    if (this._state === CircuitState.HALF_OPEN) {
      this._successes++;
      if (this._successes >= this.successThreshold) {
        this.reset();
      }
      return;
    }

    this._failures = 0;
    this._state = CircuitState.CLOSED;
  }

  private handleFailure(): void {
    this._failures++;
    this.lastFailureTime = Date.now();

    if (this._state === CircuitState.HALF_OPEN || this._failures >= this.failureThreshold) {
      this._state = CircuitState.OPEN;
    }
  }
}
