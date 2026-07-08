import { describe, expect, it } from 'vitest';
import {
  AuthenticationError,
  ConflictError,
  DomainError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from './domain-error';

describe('Domain Errors', () => {
  describe('DomainError (Base)', () => {
    it('should create a basic domain error', () => {
      const error = new DomainError('Base error', 'BASE_CODE', { foo: 'bar' });
      expect(error.message).toBe('Base error');
      expect(error.code).toBe('BASE_CODE');
      expect(error.context).toEqual({ foo: 'bar' });
      expect(error.name).toBe('DomainError');
    });
  });

  describe('NotFoundError', () => {
    it('should create with ID', () => {
      const error = new NotFoundError('Product', '123');
      expect(error.message).toBe('Product not found: 123');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.context).toEqual({ entity: 'Product', id: '123' });
      expect(error.name).toBe('NotFoundError');
    });

    it('should create without ID', () => {
      const error = new NotFoundError('Product');
      expect(error.message).toBe('Product not found');
      expect(error.context).toEqual({ entity: 'Product', id: undefined });
    });
  });

  describe('ValidationError', () => {
    it('should create with field and value', () => {
      const error = new ValidationError('Invalid email', 'email', 'not-an-email');
      expect(error.message).toBe('Invalid email');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.context).toEqual({ field: 'email', value: 'not-an-email' });
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create with default message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized');
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should create with custom message', () => {
      const error = new UnauthorizedError('Custom unauthorized');
      expect(error.message).toBe('Custom unauthorized');
    });
  });

  describe('AuthenticationError', () => {
    it('should create with default message', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Not authenticated');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.name).toBe('AuthenticationError');
    });
  });

  describe('ConflictError', () => {
    it('should create with message and context', () => {
      const error = new ConflictError('Already exists', 'User', '456');
      expect(error.message).toBe('Already exists');
      expect(error.code).toBe('CONFLICT');
      expect(error.context).toEqual({ entity: 'User', id: '456' });
      expect(error.name).toBe('ConflictError');
    });
  });
});
