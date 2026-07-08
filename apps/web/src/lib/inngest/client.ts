import { Inngest } from 'inngest';

/**
 * Singleton Inngest client for PranaKaia.
 * All functions must be created from this client to ensure consistent app ID
 * and event schema sharing.
 *
 * ADR-016: Background Jobs & Event-Driven Architecture
 */
export const inngest = new Inngest({ id: 'pranakaia' });
