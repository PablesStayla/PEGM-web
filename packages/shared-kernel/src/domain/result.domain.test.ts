import { describe, expect, it } from 'vitest';
import { DomainError } from './result';

describe('DomainError', () => {
  it('should create error with code and context', () => {
    const context = { userId: '123', action: 'delete' };
    const error = new DomainError('User not found', 'USER_NOT_FOUND', context);

    expect(error.message).toBe('User not found');
    expect(error.code).toBe('USER_NOT_FOUND');
    expect(error.context).toBe(context);
    expect(error.name).toBe('DomainError');
  });

  it('should default code to DOMAIN_ERROR', () => {
    const error = new DomainError('Test error');

    expect(error.code).toBe('DOMAIN_ERROR');
  });

  it('should accept undefined context', () => {
    const error = new DomainError('Test error', 'TEST_CODE', undefined);

    expect(error.context).toBeUndefined();
  });

  it('should preserve context object reference', () => {
    const context = { key: 'value' };
    const error = new DomainError('Error', 'CODE', context);

    expect(error.context).toBe(context);
  });

  it('should handle complex context objects', () => {
    const context = {
      userId: '123',
      action: 'delete',
      metadata: {
        timestamp: Date.now(),
        source: 'api',
      },
    };
    const error = new DomainError('Complex error', 'COMPLEX', context);

    expect(error.context).toEqual(context);
  });
});

describe('DomainError - Edge Cases', () => {
  it('should handle empty message', () => {
    const error = new DomainError('', 'EMPTY');

    expect(error.message).toBe('');
    expect(error.code).toBe('EMPTY');
  });

  it('should handle long messages', () => {
    const longMessage = 'A'.repeat(1000);
    const error = new DomainError(longMessage, 'LONG');

    expect(error.message).toBe(longMessage);
    expect(error.code).toBe('LONG');
  });

  it('should handle special characters in message', () => {
    const message = 'Error: <script>alert("xss")</script>';
    const error = new DomainError(message, 'SPECIAL');

    expect(error.message).toBe(message);
    expect(error.code).toBe('SPECIAL');
  });
});
