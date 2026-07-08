import type { DomainEvent, EventBusPort } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it } from 'vitest';
import { FakeAuthenticator } from '../../../infrastructure/hashing/fake-authenticator.mock';
import { InMemoryUserRepository } from '../../../infrastructure/persistence/in-memory-user.repository.mock';
import { SignUpCommand } from './sign-up.command';
import { SignUpUseCase } from './sign-up.use-case';

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

describe('SignUpUseCase', () => {
  let useCase: SignUpUseCase;
  let userRepository: InMemoryUserRepository;
  let authenticator: FakeAuthenticator;
  let eventBus: FakeEventBus;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    authenticator = new FakeAuthenticator();
    eventBus = new FakeEventBus();

    useCase = new SignUpUseCase(userRepository, authenticator, eventBus);
  });

  it('signs up successfully', async () => {
    const email = 'newuser@example.com';
    const password = 'Password123!';
    const commandResult = SignUpCommand.create({
      email,
      password,
      confirmPassword: password,
    });

    expect(commandResult.isSuccess).toBe(true);
    const command = commandResult.getValue();

    const result = await useCase.execute(command);

    expect(result.isSuccess).toBe(true);
    const value = result.getValue();
    expect(value.email).toBe(email);
    expect(value.requiresEmailVerification).toBe(true);
    expect(value.userId).toBeDefined();

    // Verify user was saved
    const savedUserResult = await userRepository.findByEmail(command.email);
    expect(savedUserResult.isSuccess).toBe(true);
    expect(savedUserResult.getValue()).not.toBeNull();

    // Verify event was published
    expect(eventBus.publishedEvents).toHaveLength(1);
    expect(eventBus.publishedEvents[0]!.constructor.name).toBe('UserCreated');
  });

  it('fails if email already exists', async () => {
    const email = 'existing@example.com';
    const password = 'Password123!';

    // Pre-create user
    const existingUserCommandResult = SignUpCommand.create({
      email,
      password,
      confirmPassword: password,
    });
    expect(existingUserCommandResult.isSuccess).toBe(true);
    await useCase.execute(existingUserCommandResult.getValue());

    const secondSignUpCommandResult = SignUpCommand.create({
      email,
      password,
      confirmPassword: password,
    });
    expect(secondSignUpCommandResult.isSuccess).toBe(true);
    const result = await useCase.execute(secondSignUpCommandResult.getValue());

    expect(result.isFailure).toBe(true);
    expect(result.errorValue.message).toBe('Email already registered');
  });
});
