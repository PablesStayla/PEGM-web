import { beforeEach, describe, expect, it } from 'vitest';
import { CircuitBreaker, CircuitState } from './circuit-breaker';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      successThreshold: 1,
      timeout: 1000,
    });
  });

  describe('creation', () => {
    it('should create circuit breaker in closed state', () => {
      expect(circuitBreaker.state).toBe(CircuitState.CLOSED);
    });

    it('should accept custom thresholds', () => {
      const custom = new CircuitBreaker({
        failureThreshold: 5,
        successThreshold: 1,
        timeout: 2000,
      });

      expect(custom).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should execute successful function', async () => {
      const result = await circuitBreaker.execute(() => Promise.resolve('success'));
      expect(result).toBe('success');
      expect(circuitBreaker.state).toBe(CircuitState.CLOSED);
    });

    it('should track failures', async () => {
      await circuitBreaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
      await circuitBreaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});

      expect(circuitBreaker.failures).toBe(2);
    });

    it('should open circuit after threshold failures', async () => {
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
      }

      expect(circuitBreaker.state).toBe(CircuitState.OPEN);
    });

    it('should reject calls when circuit is open', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
      }

      // Try to execute
      await expect(circuitBreaker.execute(() => Promise.resolve('test'))).rejects.toThrow(
        'Circuit breaker is open',
      );
    });
  });

  describe('timeout', () => {
    it('should transition to half-open after timeout', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
      }

      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(circuitBreaker.state).toBe(CircuitState.HALF_OPEN);
    });

    it('should close circuit after successful half-open execution', async () => {
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
      }

      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(circuitBreaker.state).toBe(CircuitState.HALF_OPEN);

      await circuitBreaker.execute(() => Promise.resolve('success'));

      expect(circuitBreaker.state).toBe(CircuitState.CLOSED);
    });
  });

  describe('reset', () => {
    it('should reset circuit breaker', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
      }

      expect(circuitBreaker.state).toBe(CircuitState.OPEN);

      // Reset
      circuitBreaker.reset();

      expect(circuitBreaker.state).toBe(CircuitState.CLOSED);
      expect(circuitBreaker.failures).toBe(0);
    });
  });
});

describe('CircuitState enum', () => {
  it('should have all states', () => {
    expect(CircuitState.CLOSED).toBe('CLOSED');
    expect(CircuitState.OPEN).toBe('OPEN');
    expect(CircuitState.HALF_OPEN).toBe('HALF_OPEN');
  });
});
