import type { DomainEvent } from './domain/domain-event';

export type { DomainEvent, DomainEventHandler } from './domain/domain-event';
export { DomainEventBase } from './domain/domain-event';

/**
 * Creates a typed domain event with the given payload.
 *
 * Factory function that produces a frozen, standards-compliant domain event
 * suitable for publishing to an {@link EventBusPort}.
 *
 * @template T - The payload type for the event.
 * @param type - The event type name (e.g. `'cart.item_added'`).
 * @param aggregateId - The identifier of the aggregate that produced the event.
 * @param payload - The event-specific data.
 * @param version - Schema version for event evolution. Defaults to `1`.
 * @param traceId - Optional distributed tracing correlation ID.
 *
 * @example
 * ```ts
 * const event = createEvent('cart.item_added', cartId, {
 *   productId: 'prod_123',
 *   quantity: 2,
 * });
 * ```
 */
export const createEvent = <T>(
  type: string,
  aggregateId: string,
  payload: T,
  version = 1,
  traceId?: string,
): DomainEvent & { readonly payload: T } =>
  Object.freeze({
    type,
    version,
    aggregateId,
    occurredAt: new Date(),
    payload,
    traceId,
    metadata: {},
  }) as DomainEvent & { readonly payload: T };
