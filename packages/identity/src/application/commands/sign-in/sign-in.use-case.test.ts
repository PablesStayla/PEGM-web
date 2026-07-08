/**
 * SignInUseCase integration test
 * Uses in-memory fakes — zero infrastructure dependencies
 */
import type { DomainEvent, EventBusPort } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it } from 'vitest';
import { FakeRateLimiter } from '../../../domain/session/fake-rate-limiter.mock';
import { InMemorySessionRepository } from '../../../domain/session/in-memory-session.repository.mock';
import { Email } from '../../../domain/user/email.vo';
import { User } from '../../../domain/user/user.entity';
import { UserId } from '../../../domain/user/user-id.vo';
import { FakeAuthenticator } from '../../../infrastructure/hashing/fake-authenticator.mock';
import { InMemoryUserRepository } from '../../../infrastructure/persistence/in-memory-user.repository.mock';
import { SignInCommand } from './sign-in.command';
import { SignInUseCase } from './sign-in.use-case';

class FakeEventBus implements EventBusPort {
  publishedEvents: DomainEvent[] = [];
  async publish(event: DomainEvent): Promise<void> {
    this.publishedEvents.push(event);
  }
  async publishAll(events: DomainEvent[]): Promise<void> {
    this.publishedEvents.push(...events);
  }
  subscribe(): void {}
  unsubscribe(): void {}
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeUser(emailStr: string) {
  const emailResult = Email.create(emailStr);
  if (emailResult.isFailure) {
    throw new Error(`Email.create failed: ${emailResult.errorValue.message}`);
  }

  const email = emailResult.getValue();
  const id = UserId.generate();

  const userResult = User.create({ id, email, emailVerified: true });
  if (userResult.isFailure) {
    throw new Error(`User.create failed: ${userResult.errorValue.message}`);
  }

  return userResult.getValue();
}

function makeCommand(
  emailStr: string,
  passwordStr: string,
  _extra: { block?: boolean } = {},
): SignInCommand {
  const result = SignInCommand.create({
    email: emailStr,
    password: passwordStr,
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
  });
  if (result.isFailure) {
    throw new Error(`SignInCommand.create failed: ${result.errorValue.message}`);
  }
  return result.getValue();
}

describe('SignInUseCase', () => {
  let useCase: SignInUseCase;
  let userRepository: InMemoryUserRepository;
  let sessionRepository: InMemorySessionRepository;
  let authenticator: FakeAuthenticator;
  let rateLimiter: FakeRateLimiter;
  let eventBus: FakeEventBus;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sessionRepository = new InMemorySessionRepository();
    authenticator = new FakeAuthenticator();
    rateLimiter = new FakeRateLimiter();
    eventBus = new FakeEventBus();

    useCase = new SignInUseCase(
      userRepository,
      sessionRepository,
      authenticator,
      rateLimiter,
      eventBus,
    );
  });

  it('signs in successfully with valid credentials', async () => {
    const emailStr = 'test@example.com';
    const passwordStr = 'Password123!';
    const user = makeUser(emailStr);

    await userRepository.save(user);
    authenticator.setUserPassword(user.id, passwordStr);

    const command = makeCommand(emailStr, passwordStr);
    const result = await useCase.execute(command);

    expect(result.success).toBe(true);
    if (result.success) {
      const value = result.getValue();
      expect(value.status).toBe('SUCCESS');
      expect(value.session).toBeDefined();
      expect(value.session?.userId).toBe(user.id);
    }
    expect(eventBus.publishedEvents).toHaveLength(1);
  });

  it('requires 2FA if authenticator says so', async () => {
    const emailStr = '2fa@example.com';
    const passwordStr = 'Password123!';
    const user = makeUser(emailStr);

    await userRepository.save(user);
    authenticator.setUserPassword(user.id, passwordStr);
    authenticator.setRequires2FA(true);

    const command = makeCommand(emailStr, passwordStr);
    const result = await useCase.execute(command);

    expect(result.success).toBe(true);
    if (result.success) {
      const value = result.getValue();
      expect(value.status).toBe('2FA_REQUIRED');
      expect(value.tempToken).toBeDefined();
    }
    expect(eventBus.publishedEvents).toHaveLength(1);
  });

  it('fails if user not found', async () => {
    const command = makeCommand('ghost@example.com', 'Password123!');
    const result = await useCase.execute(command);

    expect(result.success).toBe(false);
    expect(result.errorValue?.message).toBe('Invalid credentials');
  });

  it('fails if password invalid', async () => {
    const emailStr = 'wrongpass@example.com';
    const user = makeUser(emailStr);

    await userRepository.save(user);
    authenticator.setUserPassword(user.id, 'CorrectPassword123!');

    const command = makeCommand(emailStr, 'WrongPassword123!');
    const result = await useCase.execute(command);

    expect(result.success).toBe(false);
    expect(result.errorValue?.message).toBe('Invalid credentials');
  });

  it('fails if rate limited', async () => {
    const emailStr = 'blocked@example.com';
    rateLimiter.block(emailStr);

    const command = makeCommand(emailStr, 'Password123!');
    const result = await useCase.execute(command);

    expect(result.success).toBe(false);
    expect(result.errorValue?.message).toContain('Rate limit exceeded');
  });
});
