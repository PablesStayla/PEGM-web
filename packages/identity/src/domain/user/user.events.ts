import { DomainEventBase } from '@pranakaia/shared-kernel';

/** User Domain Events */

/** Emitted when a new user registers. */
export class UserCreated extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly email: string,
    readonly role: string,
  ) {
    super('UserCreated', aggregateId, 1);
  }
}

/**
 * Emitted when a user changes their email.
 *
 * @example
 * ```ts
 * const event = new UserEmailChanged(userId, 'new@email.com');
 * ```
 */
export class UserEmailChanged extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly newEmail: string,
  ) {
    super('UserEmailChanged', aggregateId, 1);
  }
}

/** Emitted when a user verifies their email address. */
export class UserEmailVerified extends DomainEventBase {
  constructor(aggregateId: string) {
    super('UserEmailVerified', aggregateId, 1);
  }
}

/** Emitted when a user is promoted to admin role. */
export class UserPromotedToAdmin extends DomainEventBase {
  constructor(aggregateId: string) {
    super('UserPromotedToAdmin', aggregateId, 1);
  }
}

/**
 * Emitted when a user signs in.
 *
 * @example
 * ```ts
 * const event = new UserSignedIn(userId, sessionId, '192.168.1.1');
 * ```
 */
export class UserSignedIn extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly sessionId: string,
    readonly ipAddress?: string,
    readonly userAgent?: string,
  ) {
    super('UserSignedIn', aggregateId, 1);
  }
}

/** Emitted when a user signs out. */
export class UserSignedOut extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly sessionId: string,
  ) {
    super('UserSignedOut', aggregateId, 1);
  }
}

/** Emitted when 2FA is enabled on an account. */
export class TwoFactorEnabled extends DomainEventBase {
  constructor(aggregateId: string) {
    super('TwoFactorEnabled', aggregateId, 1);
  }
}

/** Emitted when 2FA is disabled on an account. */
export class TwoFactorDisabled extends DomainEventBase {
  constructor(aggregateId: string) {
    super('TwoFactorDisabled', aggregateId, 1);
  }
}

/**
 * Emitted when 2FA verification is required after initial auth.
 *
 * @example
 * ```ts
 * const event = new TwoFactorRequired(userId, tempToken);
 * ```
 */
export class TwoFactorRequired extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly tempToken: string,
  ) {
    super('TwoFactorRequired', aggregateId, 1);
  }
}
