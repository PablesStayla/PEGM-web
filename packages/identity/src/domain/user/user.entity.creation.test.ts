import { describe, expect, it } from 'vitest';
import { Email } from './email.vo';
import { User } from './user.entity';
import { UserCreated } from './user.events';
import type { UserId } from './user-id.vo';
import { UserRole } from './user-role.vo';

const createTestUser = (overrides?: Partial<Parameters<typeof User.create>[0]>): User => {
  const email = Email.create('test@example.com');
  if (!email.success) {
    throw email.error;
  }

  const props: Parameters<typeof User.create>[0] = {
    id: `user_${Date.now()}` as UserId,
    email: email.getValue(),
    emailVerified: false,
    role: UserRole.CUSTOMER,
    ...overrides,
  };

  const result = User.create(props);
  if (!result.success) {
    throw result.error;
  }
  return result.getValue();
};

describe('User Entity - Creation', () => {
  describe('creation', () => {
    it('should create user with valid data', () => {
      const user = createTestUser();

      expect(user.email.value).toBe('test@example.com');
      expect(user.emailVerified).toBe(false);
      expect(user.role).toBe(UserRole.CUSTOMER);
    });

    it('should create user with admin role', () => {
      const email = Email.create('admin@example.com').getValue();
      const result = User.create({
        id: 'user_admin' as UserId,
        email,
        emailVerified: true,
        role: UserRole.ADMIN,
      });

      if (result.success) {
        const user = result.getValue();
        expect(user.role).toBe(UserRole.ADMIN);
        expect(user.isAdmin).toBe(true);
      }
    });

    it('should default to CUSTOMER role', () => {
      const email = Email.create('customer@example.com').getValue();
      const result = User.create({
        id: 'user_cust' as UserId,
        email,
        emailVerified: false,
      });

      if (result.success) {
        expect(result.getValue().role).toBe(UserRole.CUSTOMER);
      }
    });

    it('should set creation timestamps', () => {
      const before = Date.now();
      const user = createTestUser();
      const after = Date.now();

      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after);
    });

    it('should accept custom timestamps', () => {
      const customDate = new Date('2024-01-01');
      const email = Email.create('test@example.com').getValue();
      const result = User.create({
        id: 'user_test' as UserId,
        email,
        emailVerified: false,
        createdAt: customDate,
        updatedAt: customDate,
      });

      if (result.success) {
        const user = result.getValue();
        expect(user.createdAt).toBe(customDate);
        expect(user.updatedAt).toBe(customDate);
      }
    });

    it('should emit UserCreated event on creation', () => {
      const email = Email.create('test@example.com').getValue();
      const result = User.create({
        id: 'user_test' as UserId,
        email,
        emailVerified: false,
      });

      if (result.success) {
        const events = result.getValue().getUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(UserCreated);
      }
    });
  });
});
