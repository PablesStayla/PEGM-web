import { describe, expect, it } from 'vitest';
import { createEvent } from './events';

describe('events', () => {
  describe('createEvent', () => {
    it('should create a valid domain event', () => {
      const type = 'USER_CREATED';
      const aggregateId = 'user_123';
      const payload = { email: 'test@example.com' };

      const event = createEvent(type, aggregateId, payload);

      expect(event.type).toBe(type);
      expect(event.aggregateId).toBe(aggregateId);
      expect(event.payload).toEqual(payload);
      expect(event.version).toBe(1);
      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(Object.isFrozen(event)).toBe(true);
    });

    it('should allow custom version and traceId', () => {
      const event = createEvent('TYPE', 'ID', {}, 2, 'trace_456');
      expect(event.version).toBe(2);
      expect(event.traceId).toBe('trace_456');
    });
  });
});
