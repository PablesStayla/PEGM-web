import { beforeEach, describe, expect, it } from 'vitest';
import { Email } from './email.vo';
import { User } from './user.entity';
import { UserEmailChanged } from './user.events';
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

describe('User Entity - Email Operations', () => {
  let user: User;

  beforeEach(() => {
    user = createTestUser();
  });

  describe('changeEmail', () => {
    it('should change email', () => {
      const newEmail = Email.create('new@example.com').getValue();
      const result = user.changeEmail(newEmail);

      expect(result.success).toBe(true);
      expect(user.email.value).toBe('new@example.com');
    });

    it('should unverify email after change', () => {
      user.verifyEmail();
      expect(user.emailVerified).toBe(true);

      const newEmail = Email.create('new@example.com').getValue();
      user.changeEmail(newEmail);

      expect(user.emailVerified).toBe(false);
    });

    it('should emit UserEmailChanged event', () => {
      const newEmail = Email.create('new@example.com').getValue();
      user.markCommitted();
      user.changeEmail(newEmail);

      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserEmailChanged);
    });

    it('should fail if email is same', () => {
      const sameEmail = Email.create('test@example.com').getValue();
      const result = user.changeEmail(sameEmail);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('different');
    });
  });

  describe('verifyEmail', () => {
    it('should mark email as verified', () => {
      const user = createTestUser();
      expect(user.emailVerified).toBe(false);

      user.verifyEmail();
      expect(user.emailVerified).toBe(true);
    });

    it('should not emit events', () => {
      const user = createTestUser();
      user.markCommitted();
      user.verifyEmail();

      expect(user.getUncommittedEvents()).toHaveLength(0);
    });
  });
});

describe('User Entity - Role Management', () => {
  let user: User;

  beforeEach(() => {
    user = createTestUser();
  });

  describe('promoteToAdmin', () => {
    it('should promote user to admin', () => {
      expect(user.role).toBe(UserRole.CUSTOMER);

      user.promoteToAdmin();
      expect(user.role).toBe(UserRole.ADMIN);
    });

    it('should make user admin', () => {
      user.promoteToAdmin();
      expect(user.isAdmin).toBe(true);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin', () => {
      const email = Email.create('admin@example.com').getValue();
      const result = User.create({
        id: 'user_admin' as UserId,
        email,
        emailVerified: true,
        role: UserRole.ADMIN,
      });

      if (result.success) {
        expect(result.getValue().isAdmin).toBe(true);
      }
    });

    it('should return false for customer', () => {
      const user = createTestUser();
      expect(user.isAdmin).toBe(false);
    });
  });
});

describe('User Entity - Serialization & Edge Cases', () => {
  describe('toPrimitives', () => {
    it('should return plain object', () => {
      const user = createTestUser();
      const primitives = user.toPrimitives();

      expect(primitives.id).toBeDefined();
      expect(primitives.email).toBe('test@example.com');
      expect(primitives.emailVerified).toBe(false);
      expect(primitives.role).toBe('CUSTOMER');
      expect(typeof primitives.createdAt).toBe('string');
      expect(typeof primitives.updatedAt).toBe('string');
    });

    it('should serialize dates as ISO strings', () => {
      const user = createTestUser();
      const primitives = user.toPrimitives();

      expect(primitives.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(primitives.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('edge cases', () => {
    it('should handle email with subdomain', () => {
      const email = Email.create('user@mail.example.com');
      const result = User.create({
        id: 'user_test' as UserId,
        email: email.getValue(),
        emailVerified: false,
      });

      expect(result.success).toBe(true);
    });

    it('should handle long email addresses', () => {
      const longLocal = 'a'.repeat(200);
      const email = Email.create(`${longLocal}@example.com`);
      const result = User.create({
        id: 'user_test' as UserId,
        email: email.getValue(),
        emailVerified: false,
      });

      expect(result.success).toBe(true);
    });
  });
});
