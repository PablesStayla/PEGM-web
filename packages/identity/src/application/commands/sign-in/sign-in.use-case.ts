/**
 * SignIn Use Case - Application Layer
 *
 * Implements the sign-in business logic following Clean Architecture.
 * Coordinates domain entities, repositories, and external services.
 */

import { type EventBusPort, Result, type UseCase } from '@pranakaia/shared-kernel';
import type {
  AuthenticationResult,
  Authenticator,
} from '../../../domain/credentials/authenticator.port';
import type { RateLimiter } from '../../../domain/session/rate-limiter.port';
import { Session } from '../../../domain/session/session.entity';
import type { SessionRepositoryPort } from '../../../domain/session/session.repository.port';
import { SessionId } from '../../../domain/session/session-id.vo';
import type { Email } from '../../../domain/user/email.vo';
import type { User } from '../../../domain/user/user.entity';
import { TwoFactorRequired, UserSignedIn } from '../../../domain/user/user.events';
import type { UserRepositoryPort } from '../../../domain/user/user.repository.port';
import type { UserId } from '../../../domain/user/user-id.vo';
import type { SignInCommand } from './sign-in.command';

/**
 * SignIn result DTO
 */
export interface SignInResult {
  readonly status: 'SUCCESS' | '2FA_REQUIRED' | 'FAILED';
  readonly session?: Session;
  readonly tempToken?: string;
  readonly message?: string;
}

/**
 * SignIn Use Case
 *
 * Coordinates:
 * 1. Rate limiting check
 * 2. Find user by email
 * 3. Validate credentials
 * 4. Check 2FA requirement
 * 5. Create session
 * 6. Publish domain events
 */
export class SignInUseCase implements UseCase<SignInCommand, SignInResult> {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly sessionRepository: SessionRepositoryPort,
    private readonly authenticator: Authenticator,
    private readonly rateLimiter: RateLimiter,
    private readonly eventBus: EventBusPort,
  ) {}

  async execute(command: SignInCommand): Promise<Result<SignInResult, Error>> {
    const rateLimitCheck = await this.checkRateLimit(command.email.value);
    if (rateLimitCheck.isFailure) {
      return Result.err(rateLimitCheck.errorValue);
    }

    const userAuthCheck = await this.findAndAuthenticateUser(command.email, command.password);
    if (userAuthCheck.isFailure) {
      return Result.err(userAuthCheck.errorValue);
    }

    const { user, authData } = userAuthCheck.getValue();
    if (authData.requires2FA) {
      const tempToken = await this.generateTempToken(user.id);
      await this.eventBus.publish(new TwoFactorRequired(user.id, tempToken));
      return Result.ok({
        status: '2FA_REQUIRED',
        tempToken,
      });
    }

    const sessionResult = await this.createAndSaveSession(user.id, command);
    if (sessionResult.isFailure) {
      return Result.err(sessionResult.errorValue);
    }

    const session = sessionResult.getValue();
    await this.eventBus.publish(
      new UserSignedIn(user.id, session.id, command.ipAddress, command.userAgent),
    );

    return Result.ok({
      status: 'SUCCESS',
      session,
    });
  }

  private async checkRateLimit(email: string): Promise<Result<void, Error>> {
    const rateLimitResult = await this.rateLimiter.check(email);
    if (rateLimitResult.isFailure) {
      return Result.err(rateLimitResult.errorValue as Error);
    }
    if (!rateLimitResult.getValue()) {
      return Result.err(new Error('Rate limit exceeded. Try again later.'));
    }
    return Result.ok(undefined);
  }

  private async findAndAuthenticateUser(
    email: Email,
    password: string,
  ): Promise<Result<{ user: User; authData: AuthenticationResult }, Error>> {
    const userResult = await this.userRepository.findByEmail(email);
    if (userResult.isFailure) {
      return Result.err(userResult.errorValue as Error);
    }

    const user = userResult.getValue();
    if (!user) {
      return Result.err(new Error('Invalid credentials'));
    }

    const authResult = await this.authenticator.authenticate(user.id, password);
    if (authResult.isFailure) {
      await this.rateLimiter.recordFailure(email.value);
      return Result.err(new Error('Invalid credentials'));
    }

    return Result.ok({ user, authData: authResult.getValue() });
  }

  private async createAndSaveSession(
    userId: UserId,
    command: SignInCommand,
  ): Promise<Result<Session, Error>> {
    const sessionResult = Session.create({
      id: SessionId.generate(),
      userId,
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
      expiresInHours: command.rememberMe ? 168 : 24,
    });

    if (sessionResult.isFailure) {
      return Result.err(sessionResult.errorValue as Error);
    }

    const session = sessionResult.getValue();
    const saveResult = await this.sessionRepository.save(session);
    if (saveResult.isFailure) {
      return Result.err(saveResult.errorValue as Error);
    }

    return Result.ok(session);
  }

  private async generateTempToken(userId: string): Promise<string> {
    // Simple implementation - in production use JWT or similar
    return `temp_${userId}_${Date.now()}`;
  }
}
