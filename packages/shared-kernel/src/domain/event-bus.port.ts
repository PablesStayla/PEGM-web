import type { DomainEvent } from './domain-event';

/**
 * Handler function for a domain event.
 *
 * @template T - The specific domain event type to handle.
 *
 * @example
 * ```ts
 * const handler: EventHandler<ItemAddedEvent> = (event) => {
 *   console.log(`Item ${event.item.name} added to cart`);
 * };
 * ```
 */
export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;

/**
 * Port for the domain event bus — publish/subscribe infrastructure.
 *
 * Implementations may use in-memory, Redis, Kafka, or any message broker.
 *
 * @example
 * ```ts
 * class InMemoryEventBus implements EventBusPort {
 *   async publish(event: DomainEvent): Promise<void> { ... }
 *   async publishAll(events: DomainEvent[]): Promise<void> { ... }
 *   subscribe<T>(type: string, handler: EventHandler<T>): void { ... }
 *   unsubscribe<T>(type: string, handler: EventHandler<T>): void { ... }
 * }
 * ```
 */
export interface EventBusPort {
  /** Publishes a single domain event. */
  publish<T extends DomainEvent>(event: T): Promise<void>;
  /** Publishes multiple domain events atomically. */
  publishAll(events: DomainEvent[]): Promise<void>;
  /** Subscribes a handler to a specific event type. */
  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void;
  /** Unsubscribes a handler from a specific event type. */
  unsubscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void;
}

/**
 * Port for the event store — append-only log for event sourcing.
 *
 * @example
 * ```ts
 * class PostgresEventStore implements EventStorePort {
 *   async append(aggregateId, events, expectedVersion) { ... }
 *   async getEvents(aggregateId) { ... }
 * }
 * ```
 */
export interface EventStorePort {
  /** Appends events to an aggregate stream with optimistic concurrency check. */
  append(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void>;
  /** Retrieves all events for an aggregate. */
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  /** Retrieves events from a global position (for projections/replays). */
  getEventsFrom(position: number, limit: number): Promise<DomainEvent[]>;
}
