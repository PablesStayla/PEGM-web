export interface DomainEvent {
  readonly type: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly version: number;
  readonly payload?: unknown;
  readonly traceId?: string;
  readonly metadata?: Record<string, unknown>;
}

export abstract class DomainEventBase implements DomainEvent {
  readonly occurredAt = new Date();
  readonly payload?: unknown;
  readonly traceId?: string;
  readonly metadata?: Record<string, unknown>;

  get eventType(): string {
    return this.type;
  }

  get occurredOn(): Date {
    return this.occurredAt;
  }

  constructor(
    readonly type: string,
    readonly aggregateId: string,
    readonly version: number = 1,
    payload?: unknown,
  ) {
    if (payload !== undefined) {
      this.payload = payload;
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      type: this.type,
      aggregateId: this.aggregateId,
      occurredAt: this.occurredAt.toISOString(),
      version: this.version,
      ...(this.payload !== undefined && { payload: this.payload }),
      ...(this.traceId !== undefined && { traceId: this.traceId }),
    };
  }
}

export type DomainEventHandler<T extends DomainEvent = DomainEvent> = (
  event: T,
) => void | Promise<void>;
