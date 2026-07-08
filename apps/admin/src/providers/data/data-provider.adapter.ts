/**
 * Default Data Provider Adapter.
 *
 * Implements the `DataProvider` Port by delegating to the resource-specific
 * server actions / queries that already live under `resources/<dominio>/`.
 *
 * Each resource registers a `ResourceHandlers` object via `registerResource`.
 * The adapter is just a thin dispatcher — the real data access happens in the
 * resource's own `queries/` and `actions/` folders, which can keep using
 * Drizzle, Supabase, or any future backend.
 *
 * This indirection is what makes the admin **infrastructure-agnostic from the
 * UI's perspective**.
 *
 * @module providers/data/data-provider.adapter
 */

import 'server-only';
import type { DataProvider, Id, ListParams, Page, ResourceName } from './data-provider';
import { liftToAdminError } from './result-bridge';

export interface ResourceHandlers<T = unknown> {
  list?: (params: ListParams) => Promise<Page<T>>;
  getOne?: (id: Id) => Promise<T>;
  create?: (input: unknown) => Promise<T>;
  update?: (id: Id, input: unknown) => Promise<T>;
  remove?: (id: Id) => Promise<void>;
  custom?: Record<string, (payload: unknown) => Promise<unknown>>;
}

const registry = new Map<ResourceName, ResourceHandlers>();

/**
 * Resources call this from their `index.ts` to plug into the Data Provider.
 * Idempotent: re-registering replaces the existing handlers (useful for HMR).
 */
export function registerResource<T>(name: ResourceName, handlers: ResourceHandlers<T>): void {
  registry.set(name, handlers as ResourceHandlers);
}

function notImplemented(resource: ResourceName, method: string): never {
  throw new Error(
    `[data-provider] resource "${resource}" has no "${method}" handler. ` +
      `Register one in resources/${resource}/index.ts via registerResource().`,
  );
}

export const dataProvider: DataProvider = {
  list: <T>(resource: ResourceName, params: ListParams = {}) =>
    liftToAdminError(async () => {
      const h = registry.get(resource);
      if (!h?.list) {
        notImplemented(resource, 'list');
      }
      return (await h.list(params)) as Page<T>;
    }),

  getOne: <T>(resource: ResourceName, id: Id) =>
    liftToAdminError(async () => {
      const h = registry.get(resource);
      if (!h?.getOne) {
        notImplemented(resource, 'getOne');
      }
      return (await h.getOne(id)) as T;
    }),

  create: <T>(resource: ResourceName, input: unknown) =>
    liftToAdminError(async () => {
      const h = registry.get(resource);
      if (!h?.create) {
        notImplemented(resource, 'create');
      }
      return (await h.create(input)) as T;
    }),

  update: <T>(resource: ResourceName, id: Id, input: unknown) =>
    liftToAdminError(async () => {
      const h = registry.get(resource);
      if (!h?.update) {
        notImplemented(resource, 'update');
      }
      return (await h.update(id, input)) as T;
    }),

  remove: (resource: ResourceName, id: Id) =>
    liftToAdminError(async () => {
      const h = registry.get(resource);
      if (!h?.remove) {
        notImplemented(resource, 'remove');
      }
      await h.remove(id);
    }),

  custom: <T>(resource: ResourceName, action: string, payload?: unknown) =>
    liftToAdminError(async () => {
      const h = registry.get(resource);
      const fn = h?.custom?.[action];
      if (!fn) {
        notImplemented(resource, `custom.${action}`);
      }
      return (await fn(payload)) as T;
    }),
};
