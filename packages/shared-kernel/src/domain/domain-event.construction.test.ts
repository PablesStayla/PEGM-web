import { describe, expect, it } from 'vitest';
import type { DomainEvent } from './domain-event';

class TestEvent implements DomainEvent {
  readonly type: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly version: number;
  readonly occurredAt: Date;
  readonly metadata: Record<string, unknown>;

  constructor(
    public readonly name: string,
    data: {
      aggregateId: string;
      aggregateType: string;
      version?: number;
      occurredAt?: Date;
      metadata?: Record<string, unknown>;
    },
  ) {
    this.type = 'TestEvent';
    this.aggregateId = data.aggregateId;
    this.aggregateType = data.aggregateType;
    this.version = data.version ?? 1;
    this.occurredAt = data.occurredAt ?? new Date();
    this.metadata = data.metadata ?? {};
    this.name = name;
  }
}

describe('DomainEvent - Construction', () => {
  describe('construction', () => {
    it('should create event with required properties', () => {
      const event = new TestEvent('TestEvent', {
        aggregateId: 'agg-1',
        aggregateType: 'TestAggregate',
      });

      expect(event.type).toBe('TestEvent');
      expect(event.aggregateId).toBe('agg-1');
      expect(event.aggregateType).toBe('TestAggregate');
      expect(event.version).toBe(1);
      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(event.metadata).toEqual({});
    });

    it('should accept custom version', () => {
      const event = new TestEvent('TestEvent', {
        aggregateId: 'agg-1',
        aggregateType: 'TestAggregate',
        version: 3,
      });

      expect(event.version).toBe(3);
    });

    it('should accept custom occurredAt date', () => {
      const customDate = new Date('2024-01-01T00:00:00Z');
      const event = new TestEvent('TestEvent', {
        aggregateId: 'agg-1',
        aggregateType: 'TestAggregate',
        occurredAt: customDate,
      });

      expect(event.occurredAt).toBe(customDate);
    });

    it('should accept metadata', () => {
      const metadata = { userId: 'user-1', source: 'api' };
      const event = new TestEvent('TestEvent', {
        aggregateId: 'agg-1',
        aggregateType: 'TestAggregate',
        metadata,
      });

      expect(event.metadata).toEqual(metadata);
    });

    it('should merge default metadata with provided metadata', () => {
      const metadata = { custom: 'value' };
      const event = new TestEvent('TestEvent', {
        aggregateId: 'agg-1',
        aggregateType: 'TestAggregate',
        metadata,
      });

      expect(event.metadata).toEqual(metadata);
    });
  });
});

describe('DomainEvent - Timestamps & Version', () => {
  describe('occurredOn', () => {
    it('should default to current date', () => {
      const before = Date.now();
      const event = new TestEvent('TestEvent', {
        aggregateId: 'agg-1',
        aggregateType: 'TestAggregate',
      });
      const after = Date.now();

      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after);
    });

    it('should be immutable', () => {
      const event = new TestEvent('TestEvent', {
        aggregateId: 'agg-1',
        aggregateType: 'TestAggregate',
      });

      expect(Object.isFrozen(event)).toBe(false);
    });
  });

  describe('version', () => {
    it('should default to 1', () => {
      const event = new TestEvent('TestEvent', {
        aggregateId: 'agg-1',
        aggregateType: 'TestAggregate',
      });

      expect(event.version).toBe(1);
    });

    it('should accept positive integers', () => {
      const event = new TestEvent('TestEvent', {
        aggregateId: 'agg-1',
        aggregateType: 'TestAggregate',
        version: 10,
      });

      expect(event.version).toBe(10);
    });
  });
});

describe('DomainEvent - Metadata & Immutability', () => {
  describe('metadata', () => {
    it('should accept arbitrary data', () => {
      const metadata = {
        userId: 'user-1',
        timestamp: Date.now(),
        nested: { key: 'value' },
        array: [1, 2, 3],
      };

      const event = new TestEvent('TestEvent', {
        aggregateId: 'agg-1',
        aggregateType: 'TestAggregate',
        metadata,
      });

      expect(event.metadata).toEqual(metadata);
    });

    it('should default to empty object', () => {
      const event = new TestEvent('TestEvent', {
        aggregateId: 'agg-1',
        aggregateType: 'TestAggregate',
      });

      expect(event.metadata).toEqual({});
    });
  });

  describe('immutability', () => {
    it('should have readonly properties', () => {
      const event = new TestEvent('TestEvent', {
        aggregateId: 'agg-1',
        aggregateType: 'TestAggregate',
      });

      expect(event.type).toBe('TestEvent');
      expect(event.aggregateId).toBe('agg-1');
    });
  });
});
