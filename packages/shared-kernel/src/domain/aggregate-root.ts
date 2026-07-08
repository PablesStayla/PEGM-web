import type { DomainEvent } from './domain-event';
import { Entity, type EntityIdType } from './entity';

/**
 * Abstract base class for Aggregate Roots in Domain-Driven Design.
 *
 * An Aggregate Root is the entry point to an aggregate — a cluster of domain
 * objects treated as a single unit. It guarantees consistency within the
 * aggregate boundary and is the only object that external objects can hold
 * references to.
 *
 * Extends {@link Entity} with event-sourcing capabilities: uncommitted domain
 * events, version tracking, and rehydration support.
 *
 * @template ID - The type of the aggregate's identifier.
 *
 * @example
 * ```ts
 * class Cart extends AggregateRoot<CartId> {
 *   private items: CartItem[] = [];
 *
 *   addItem(item: CartItem): void {
 *     this.items.push(item);
 *     this.apply(new ItemAddedEvent(this.id, item));
 *   }
 *
 *   rehydrate(events: DomainEvent[]): void {
 *     for (const event of events) this.when(event);
 *   }
 *
 *   protected when(event: DomainEvent): void {
 *     if (event instanceof ItemAddedEvent) this.items.push(event.item);
 *   }
 * }
 * ```
 */
export abstract class AggregateRoot<ID extends EntityIdType> extends Entity<ID> {
  private _domainEvents: DomainEvent[] = [];
  private _version: number = 0;

  protected constructor(id: ID, createdAt: Date = new Date(), updatedAt: Date = new Date()) {
    super(id, createdAt, updatedAt);
  }

  /** Current version of the aggregate (incremented on each event). */
  get version(): number {
    return this._version;
  }

  /**
   * Set version during rehydration — only call from aggregate factories
   * or repository implementations loading from persistence.
   *
   * @example
   * ```ts
   * const cart = new Cart(id);
   * cart.setVersion(5); // loaded from DB at version 5
   * ```
   */
  protected setVersion(v: number): void {
    this._version = v;
  }

  /** Increments the aggregate version — called internally by `apply()`. */
  protected incrementVersion(): void {
    this._version++;
  }

  /**
   * Applies a domain event: records it as uncommitted and increments version.
   *
   * @example
   * ```ts
   * this.apply(new ItemAddedEvent(this.id, item));
   * ```
   */
  protected apply(event: DomainEvent): void {
    this._domainEvents.push(event);
    this.incrementVersion();
  }

  /**
   * Returns all uncommitted domain events since the last `markCommitted()`.
   *
   * @example
   * ```ts
   * const events = cart.getUncommittedEvents();
   * eventBus.publishAll(events);
   * cart.markCommitted();
   * ```
   */
  getUncommittedEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * Marks all recorded events as committed — clear after publishing to event bus.
   *
   * @example
   * ```ts
   * eventBus.publishAll(cart.getUncommittedEvents());
   * cart.markCommitted();
   * ```
   */
  markCommitted(): void {
    this._domainEvents = [];
  }

  /**
   * Rehydrates the aggregate from a stream of past events.
   * Used by repositories to reconstruct aggregate state from persistence.
   *
   * @param events - Historical domain events to replay.
   */
  abstract rehydrate(events: DomainEvent[]): void;

  /**
   * Event handler — processes a single domain event to update internal state.
   * Called during both `apply()` and `rehydrate()`.
   *
   * @param event - The domain event to handle.
   */
  protected abstract when(event: DomainEvent): void;
}
