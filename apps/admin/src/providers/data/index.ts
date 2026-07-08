/**
 * Public surface of the Data Provider layer.
 *
 * UI and resource code should only import from here:
 *
 *   import { dataProvider, AdminUIError } from '@/providers/data';
 */

export type {
  DataProvider,
  FilterDescriptor,
  Id,
  ListParams,
  Page,
  ResourceName,
  ResultPromise,
  SortDescriptor,
  SortDirection,
} from './data-provider';
export {
  dataProvider,
  type ResourceHandlers,
  registerResource,
} from './data-provider.adapter';
export {
  AdminUIError,
  liftToAdminError,
  unwrapAsync,
  unwrapOrThrow,
} from './result-bridge';
