import { type EventBusPort, Result, type UseCase } from '@pranakaia/shared-kernel';
import type { Session } from '../../../domain/session/session.entity';
import type { SessionRepositoryPort } from '../../../domain/session/session.repository.port';
import { UserSignedOut } from '../../../domain/user/user.events';
import type { SignOutCommand } from './sign-out.command';

export interface SignOutResult {
  readonly success: boolean;
  readonly sessionsRevoked: number;
}

export class SignOutUseCase implements UseCase<SignOutCommand, SignOutResult> {
  constructor(
    private readonly sessionRepository: SessionRepositoryPort,
    private readonly eventBus: EventBusPort,
  ) {}

  async execute(command: SignOutCommand): Promise<Result<SignOutResult, Error>> {
    // 1. Find session
    const sessionResult = await this.sessionRepository.findById(command.sessionId);
    if (sessionResult.isFailure) {
      return Result.err(sessionResult.errorValue as Error);
    }

    const session = sessionResult.getValue();
    if (!session) {
      return Result.err(new Error('Session not found'));
    }

    // 2. Revoke session(s)
    const revokeResult = command.revokeAllSessions
      ? await this.revokeAllSessionsForUser(session)
      : await this.revokeSingleSession(session);

    if (revokeResult.isFailure) {
      return Result.err(revokeResult.errorValue);
    }

    // 3. Publish event
    await this.eventBus.publish(new UserSignedOut(session.userId, session.id));

    return Result.ok({
      success: true,
      sessionsRevoked: revokeResult.getValue(),
    });
  }

  private async revokeAllSessionsForUser(session: Session): Promise<Result<number, Error>> {
    const revokeResult = await this.sessionRepository.revokeAllForUser(session.userId);
    if (revokeResult.isFailure) {
      return Result.err(revokeResult.errorValue as Error);
    }

    let revokedCount = 0;
    const validSessions = await this.sessionRepository.findValidByUserId(session.userId);
    if (validSessions.isSuccess) {
      revokedCount = validSessions.getValue().length;
    }
    return Result.ok(revokedCount);
  }

  private async revokeSingleSession(session: Session): Promise<Result<number, Error>> {
    session.revoke();
    const saveResult = await this.sessionRepository.save(session);
    if (saveResult.isFailure) {
      return Result.err(saveResult.errorValue as Error);
    }
    return Result.ok(1);
  }
}
