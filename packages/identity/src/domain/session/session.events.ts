import { DomainEventBase } from '@pranakaia/shared-kernel';

/** Session Domain Events */

/**
 * Emitted when a new user session is created (login).
 *
 * @example
 * ```ts
 * const event = new SessionCreated(sessionId, userId);
 * ```
 */
export class SessionCreated extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly userId: string,
  ) {
    super('SessionCreated', aggregateId, 1);
  }
}

/**
 * Emitted when a session is explicitly revoked (logout).
 *
 * @example
 * ```ts
 * const event = new SessionRevoked(sessionId, userId);
 * ```
 */
export class SessionRevoked extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly userId: string,
  ) {
    super('SessionRevoked', aggregateId, 1);
  }
}

/** Emitted when a session expires due to inactivity. */
export class SessionExpired extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly userId: string,
  ) {
    super('SessionExpired', aggregateId, 1);
  }
}

/**
 * Emitted when user activity is recorded in a session.
 *
 * @example
 * ```ts
 * const event = new SessionActivityRecorded(sessionId, userId, '192.168.1.1');
 * ```
 */
export class SessionActivityRecorded extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly userId: string,
    readonly ipAddress?: string,
  ) {
    super('SessionActivityRecorded', aggregateId, 1);
  }
}
