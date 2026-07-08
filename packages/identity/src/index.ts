/**
 * @pranakaia/identity — Identity & Access Bounded Context
 *
 * Pure domain: User aggregate, Session entity, VOs, ports, use cases.
 * NO infrastructure dependencies. Adapters live in @pranakaia/infrastructure.
 *
 * Screaming Architecture: this package screams "Identity"
 * DDD: Aggregate → User, Entity → Session, VOs → Email/Password/UserId
 * Hexagonal: Ports defined here, Adapters live in @pranakaia/infrastructure
 */

export { SignInCommand } from './application/commands/sign-in/sign-in.command';
export type { SignInResult } from './application/commands/sign-in/sign-in.use-case';
// ── Application: Use Cases ─────────────────────────────────────────────────
export {
  SignInUseCase,
  SignInUseCase as SignInHandler,
} from './application/commands/sign-in/sign-in.use-case';
export { SignOutCommand } from './application/commands/sign-out/sign-out.command';
export {
  SignOutUseCase,
  SignOutUseCase as SignOutHandler,
} from './application/commands/sign-out/sign-out.use-case';
export { SignUpCommand } from './application/commands/sign-up/sign-up.command';
export {
  SignUpUseCase,
  SignUpUseCase as SignUpHandler,
} from './application/commands/sign-up/sign-up.use-case';
// ── Auth Ports ─────────────────────────────────────────────────────────────
export type { AuthenticationResult, Authenticator } from './domain/credentials/authenticator.port';
export type { RateLimiter } from './domain/session/rate-limiter.port';
export type { CreateSessionProps } from './domain/session/session.entity';
// ── Session Entity ─────────────────────────────────────────────────────────
export { Session } from './domain/session/session.entity';
// ── Session Events ─────────────────────────────────────────────────────────
export { SessionCreated, SessionExpired, SessionRevoked } from './domain/session/session.events';
export type { SessionRepositoryPort } from './domain/session/session.repository.port';
export { SessionId } from './domain/session/session-id.vo';
// ── Value Objects ──────────────────────────────────────────────────────────
export { Email } from './domain/user/email.vo';
export { Password } from './domain/user/password.vo';
export type { CreateUserProps } from './domain/user/user.entity';
// ── User Aggregate ─────────────────────────────────────────────────────────
export { User } from './domain/user/user.entity';
// ── User Events ────────────────────────────────────────────────────────────
export {
  TwoFactorDisabled,
  TwoFactorEnabled,
  TwoFactorRequired,
  UserCreated,
  UserEmailChanged,
  UserEmailVerified,
  UserPromotedToAdmin,
  UserSignedIn,
  UserSignedOut,
} from './domain/user/user.events';
// ── User Ports (Hexagonal: interfaces defined by domain) ───────────────────
export type { UserRepositoryPort } from './domain/user/user.repository.port';
export { UserId } from './domain/user/user-id.vo';
export { UserRole, UserRoleHelper } from './domain/user/user-role.vo';
export { Argon2PasswordHasher } from './infrastructure/hashing/argon2-password-hasher';
// ── Infrastructure: Adapters ───────────────────────────────────────────────
export { DrizzleSessionRepository } from './infrastructure/persistence/drizzle-session.repository';
export { DrizzleUserRepository } from './infrastructure/persistence/drizzle-user.repository';
export { RedisRateLimiter } from './infrastructure/rate-limiting/redis-rate-limiter';
