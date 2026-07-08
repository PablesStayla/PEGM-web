/**
 * Data Provider Port (Hexagonal Architecture).
 *
 * UI components NEVER talk to Drizzle/Supabase directly. They speak to this
 * Port. Swapping infrastructure (e.g. moving from Supabase to a Hono API) only
 * requires writing a new adapter — zero changes in `resources/`.
 *
 * Inspired by Refine's `dataProvider`, but **Result-aware**: instead of
 * silently returning `null` on error, the adapter throws `AdminUIError`
 * (mapped from a `Result.err`) so React error boundaries can react with a
 * uniform toast UX.
 *
 * @module providers/data/data-provider
 */

import type { Result } from '@pranakaia/shared-kernel';

/**
 * Canonical resource identifiers. Keep in sync with `config/resources.config.ts`.
 */
export type ResourceName =
  | 'inventory'
  | 'supplier'
  | 'pricing'
  | 'orders'
  | 'products'
  | 'customers'
  | 'cms'
  | 'analytics'
  | 'automation'
  | 'monitoring'
  | 'settings'
  | 'dashboard';

export type Id = string | number;

export type SortDirection = 'asc' | 'desc';

export interface SortDescriptor {
  readonly field: string;
  readonly direction: SortDirection;
}

export interface FilterDescriptor {
  readonly field: string;
  readonly operator:
    | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'nin'
    | 'contains'
    | 'startsWith'
    | 'between';
  readonly value: unknown;
}

export interface ListParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly sort?: readonly SortDescriptor[];
  readonly filters?: readonly FilterDescriptor[];
  readonly search?: string;
}

export interface Page<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

/**
 * Generic CRUD contract any adapter must satisfy. Methods return Promises that
 * **resolve with the value** or **reject with `AdminUIError`** — never with a
 * raw `Result` (the adapter unwraps it via `result-bridge.ts`).
 */
export interface DataProvider {
  list<T>(resource: ResourceName, params?: ListParams): Promise<Page<T>>;
  getOne<T>(resource: ResourceName, id: Id): Promise<T>;
  create<T>(resource: ResourceName, input: unknown): Promise<T>;
  update<T>(resource: ResourceName, id: Id, input: unknown): Promise<T>;
  remove(resource: ResourceName, id: Id): Promise<void>;
  /** Escape hatch for non-CRUD use cases (e.g. trigger a scrape, refresh tracking). */
  custom<T>(resource: ResourceName, action: string, payload?: unknown): Promise<T>;
}

/**
 * Type helper: any adapter can declare a use-case map and the Port will infer
 * the right input/output types per resource. Resources extend this in their
 * own `actions/` folder.
 */
export type ResultPromise<T, E = Error> = Promise<Result<T, E>>;
