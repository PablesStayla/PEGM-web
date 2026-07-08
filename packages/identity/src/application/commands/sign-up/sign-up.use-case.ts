import { type EventBusPort, Result, type UseCase } from '@pranakaia/shared-kernel';
import type { Authenticator } from '../../../domain/credentials/authenticator.port';
import { User } from '../../../domain/user/user.entity';
import { UserCreated } from '../../../domain/user/user.events';
import type { UserRepositoryPort } from '../../../domain/user/user.repository.port';
import { UserId } from '../../../domain/user/user-id.vo';
import type { SignUpCommand } from './sign-up.command';

export interface SignUpResult {
  readonly userId: string;
  readonly email: string;
  readonly requiresEmailVerification: boolean;
}

export class SignUpUseCase implements UseCase<SignUpCommand, SignUpResult> {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authenticator: Authenticator,
    private readonly eventBus: EventBusPort,
  ) {}

  async execute(command: SignUpCommand): Promise<Result<SignUpResult, Error>> {
    // 1. Check if email already exists
    const existsResult = await this.userRepository.existsByEmail(command.email);
    if (existsResult.isFailure) {
      return Result.err(existsResult.errorValue as Error);
    }
    if (existsResult.getValue()) {
      return Result.err(new Error('Email already registered'));
    }

    // 2. Hash password
    const hashResult = await this.authenticator.hashPassword(command.password);
    if (hashResult.isFailure) {
      return Result.err(hashResult.errorValue as Error);
    }

    // 3. Create user
    const userId = UserId.generate();
    const userResult = User.create({
      id: userId,
      email: command.email,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (userResult.isFailure) {
      return Result.err(userResult.errorValue as Error);
    }

    const user = userResult.getValue();

    // 4. Save user
    const saveResult = await this.userRepository.save(user);
    if (saveResult.isFailure) {
      return Result.err(saveResult.errorValue as Error);
    }

    // 5. Publish domain event
    await this.eventBus.publish(new UserCreated(user.id, user.email.value, 'CUSTOMER'));

    return Result.ok({
      userId: user.id,
      email: user.email.value,
      requiresEmailVerification: true,
    });
  }
}
