import type { DomainEvent } from '../domain/domain-event';
import type { EventBusPort, EventHandler } from '../domain/event-bus.port';

/**
 * Robust in-memory implementation of the EventBusPort.
 * Decouples message passing across hexagonal domains.
 */
export class InMemoryEventBus implements EventBusPort {
  private handlers = new Map<string, EventHandler<DomainEvent>[]>();

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const list = this.handlers.get(event.type) || [];
    await Promise.all(list.map((handler) => Promise.resolve(handler(event))));
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map((event) => this.publish(event)));
  }

  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const list = this.handlers.get(eventType) || [];
    list.push(handler as unknown as EventHandler<DomainEvent>);
    this.handlers.set(eventType, list);
  }

  unsubscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const list = this.handlers.get(eventType) || [];
    this.handlers.set(
      eventType,
      list.filter((h) => h !== (handler as unknown as EventHandler<DomainEvent>)),
    );
  }
}
