import { describe, expect, it } from 'vitest';
import { AggregateRoot } from './aggregate-root';
import type { DomainEvent } from './domain-event';
import type { BrandedId } from './entity';

class TestAggregate extends AggregateRoot<BrandedId> {
  public doSomething(): void {
    this.apply({
      type: 'SOMETHING_DONE',
      aggregateId: this.idValue,
      occurredAt: new Date(),
      version: 1,
    });
  }

  rehydrate(events: DomainEvent[]): void {
    for (const event of events) {
      this.when(event);
    }
  }

  protected when(_event: DomainEvent): void {
    // Logic to update state
  }
}

describe('AggregateRoot', () => {
  it('should track domain events', () => {
    const aggregate = new TestAggregate('agg_123' as BrandedId);
    expect(aggregate.getUncommittedEvents()).toHaveLength(0);
    expect(aggregate.version).toBe(0);

    aggregate.doSomething();

    expect(aggregate.getUncommittedEvents()).toHaveLength(1);
    expect(aggregate.getUncommittedEvents()[0]!.type).toBe('SOMETHING_DONE');
    expect(aggregate.version).toBe(1);
  });

  it('should clear events when committed', () => {
    const aggregate = new TestAggregate('agg_123' as BrandedId);
    aggregate.doSomething();
    expect(aggregate.getUncommittedEvents()).toHaveLength(1);

    aggregate.markCommitted();
    expect(aggregate.getUncommittedEvents()).toHaveLength(0);
    expect(aggregate.version).toBe(1); // Version stays
  });
});
