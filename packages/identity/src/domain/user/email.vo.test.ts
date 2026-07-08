import { describe, expect, it } from 'vitest';
import { Email } from './email.vo';

describe('Email Value Object', () => {
  it('should create valid email', () => {
    const result = Email.create('test@example.com');

    expect(result.success).toBe(true);
    expect(result.value?.value).toBe('test@example.com');
  });

  it('should fail for invalid format', () => {
    const result = Email.create('invalid-email');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('INVALID_EMAIL_FORMAT');
  });

  it('should fail for empty string', () => {
    const result = Email.create('');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('EMPTY_EMAIL');
  });

  it('should fail for too long email', () => {
    const longEmail = `${'a'.repeat(250)}@example.com`;
    const result = Email.create(longEmail);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('EMAIL_TOO_LONG');
  });

  it('should normalize to lowercase', () => {
    const result = Email.create('Test@Example.COM');

    expect(result.success).toBe(true);
    expect(result.value?.value).toBe('test@example.com');
  });

  it('should trim whitespace', () => {
    const result = Email.create('  test@example.com  ');

    expect(result.success).toBe(true);
    expect(result.value?.value).toBe('test@example.com');
  });

  it('should be immutable', () => {
    const result = Email.create('test@example.com');
    const email = result.value!;

    expect(() => {
      (email as any).value = 'hacked@example.com';
    }).toThrow();
  });

  it('should equal same email', () => {
    const email1 = Email.create('test@example.com').value!;
    const email2 = Email.create('test@example.com').value!;

    expect(email1.equals(email2)).toBe(true);
  });

  it('should not equal different email', () => {
    const email1 = Email.create('test1@example.com').value!;
    const email2 = Email.create('test2@example.com').value!;

    expect(email1.equals(email2)).toBe(false);
  });
});
