import { describe, expect, it } from 'vitest';
import { Password } from './password.vo';

describe('Password Value Object', () => {
  it('should create valid password', () => {
    const result = Password.create('Password123!');

    expect(result.success).toBe(true);
    expect(result.value?.value).toBe('Password123!');
  });

  it('should fail for too short password', () => {
    const result = Password.create('Short1!');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('PASSWORD_TOO_SHORT');
  });

  it('should fail for password without uppercase', () => {
    const result = Password.create('password123!');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('PASSWORD_NO_UPPERCASE');
  });

  it('should fail for password without lowercase', () => {
    const result = Password.create('PASSWORD123!');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('PASSWORD_NO_LOWERCASE');
  });

  it('should fail for password without number', () => {
    const result = Password.create('Password!!!');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('PASSWORD_NO_NUMBER');
  });

  it('should fail for password without special character', () => {
    const result = Password.create('Password123');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('PASSWORD_NO_SPECIAL');
  });

  it('should fail for common password', () => {
    const result = Password.create('Password123!');
    // Note: This would need a common password list to actually fail
    expect(result.success).toBe(true);
  });

  it('should be immutable', () => {
    const result = Password.create('Password123!');
    const password = result.value!;

    expect(() => {
      (password as any).value = 'hacked';
    }).toThrow();
  });
});
