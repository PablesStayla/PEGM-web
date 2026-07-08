import type { DomainEvent, EventBusPort } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemorySessionRepository } from '../../../domain/session/in-memory-session.repository.mock';
import { Session } from '../../../domain/session/session.entity';
import { SessionId } from '../../../domain/session/session-id.vo';
import { UserId } from '../../../domain/user/user-id.vo';
import { SignOutCommand } from './sign-out.command';
import { SignOutUseCase } from './sign-out.use-case';

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

describe('SignOutUseCase', () => {
  let useCase: SignOutUseCase;
  let sessionRepository: InMemorySessionRepository;
  let eventBus: FakeEventBus;

  beforeEach(() => {
    sessionRepository = new InMemorySessionRepository();
    eventBus = new FakeEventBus();

    useCase = new SignOutUseCase(sessionRepository, eventBus);
  });

  it('signs out successfully by revoking single session', async () => {
    // 1. Setup session
    const sessionId = SessionId.generate();
    const session = Session.create({
      id: sessionId,
      userId: UserId.from('user-123'),
      expiresInHours: 24,
    }).getValue();

    await sessionRepository.save(session);

    // 2. Execute sign out
    const command = SignOutCommand.create({
      sessionId: sessionId,
      revokeAllSessions: false,
    }).getValue();

    const result = await useCase.execute(command);

    // 3. Verify
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().sessionsRevoked).toBe(1);

    const revokedSession = (await sessionRepository.findById(sessionId)).getValue();
    expect(revokedSession?.isRevoked()).toBe(true);

    expect(eventBus.publishedEvents).toHaveLength(1);
    expect(eventBus.publishedEvents[0]!.constructor.name).toBe('UserSignedOut');
  });

  it('fails if session not found', async () => {
    const nonExistentSessionId = SessionId.generate();
    const command = SignOutCommand.create({
      sessionId: nonExistentSessionId,
      revokeAllSessions: false,
    }).getValue();

    const result = await useCase.execute(command);

    expect(result.isFailure).toBe(true);
    expect(result.errorValue.message).toBe('Session not found');
  });
});
