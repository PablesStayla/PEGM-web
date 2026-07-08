/**
 * User Domain - Identity Bounded Context
 */

export { Email } from './email.vo';
export type { CreateUserProps } from './user.entity';
// Entity
export { User } from './user.entity';
// Domain Events
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
} from './user.events';
// Repository Port
export type { UserRepositoryPort } from './user.repository.port';
// Value Objects
export { UserId } from './user-id.vo';
export { UserRole, UserRoleHelper } from './user-role.vo';
