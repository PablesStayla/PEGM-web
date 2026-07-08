import { AggregateRoot, type DomainEvent, Result } from '@pranakaia/shared-kernel';
import type { UserId } from '../user/user-id.vo';
import { SessionCreated, SessionRevoked } from './session.events';

/**
 * Session Aggregate Root — tracks an authenticated user session.
 *
 * @example
 * ```ts
 * const result = Session.create({ userId: UserId.from('user_1'), ipAddress: '192.168.1.1' });
 * if (result.isSuccess) { const session = result.getValue(); }
 * ```
 */
import type { SessionId } from './session-id.vo';

export interface SessionProps {
  userId: UserId;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  lastActivityAt: Date;
}

export interface CreateSessionProps {
  id: SessionId;
  userId: UserId;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  expiresInHours: number;
  createdAt?: Date | undefined;
}

/**
 * Session Aggregate Root
 *
 * Represents an authenticated user session.
 */
export class Session extends AggregateRoot<SessionId> {
  private constructor(
    id: SessionId,
    private _props: SessionProps,
    createdAt?: Date,
    updatedAt?: Date,
    version?: number,
  ) {
    super(id, createdAt, updatedAt);
    if (version !== undefined) {
      this.setVersion(version);
    }
  }

  /**
   * Factory for new Sessions
   */
  static create(props: CreateSessionProps): Result<Session, Error> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + props.expiresInHours * 60 * 60 * 1000);

    const session = new Session(
      props.id,
      {
        userId: props.userId,
        ipAddress: props.ipAddress ?? null,
        userAgent: props.userAgent ?? null,
        expiresAt,
        revokedAt: null,
        lastActivityAt: now,
      },
      props.createdAt ?? now,
      now,
    );

    session.apply(new SessionCreated(session.id, session.userId));

    return Result.ok(session);
  }

  /**
   * Rehydrates entity from state (e.g. from DB)
   */
  static rehydrate(
    id: SessionId,
    props: SessionProps,
    createdAt: Date,
    updatedAt: Date,
    version: number,
  ): Session {
    return new Session(id, props, createdAt, updatedAt, version);
  }

  // --- Domain Logic ---

  isExpired(): boolean {
    return new Date() > this._props.expiresAt;
  }

  isRevoked(): boolean {
    return this._props.revokedAt !== null;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isRevoked();
  }

  revoke(): void {
    if (this.isRevoked()) {
      return;
    }

    this._props.revokedAt = new Date();
    this.apply(new SessionRevoked(this.id, this.userId));
  }

  touch(): void {
    this._props.lastActivityAt = new Date();
  }

  // --- Accessors ---

  get userId(): UserId {
    return this._props.userId;
  }

  get ipAddress(): string | null {
    return this._props.ipAddress;
  }

  get userAgent(): string | null {
    return this._props.userAgent;
  }

  get expiresAt(): Date {
    return this._props.expiresAt;
  }

  get lastActivityAt(): Date {
    return this._props.lastActivityAt;
  }

  get revokedAt(): Date | null {
    return this._props.revokedAt;
  }

  // --- Implementation ---

  rehydrate(events: DomainEvent[]): void {
    events.forEach((event) => {
      this.when(event);
    });
  }

  protected when(event: DomainEvent): void {
    if (event instanceof SessionRevoked) {
      this._props.revokedAt = new Date();
    }
  }

  /**
   * Serializes to a plain object
   */
  toPrimitives() {
    return {
      id: this.id,
      userId: this._props.userId,
      ipAddress: this._props.ipAddress,
      userAgent: this._props.userAgent,
      expiresAt: this._props.expiresAt.toISOString(),
      lastActivityAt: this._props.lastActivityAt.toISOString(),
      revokedAt: this._props.revokedAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      version: this.version,
    };
  }
}
