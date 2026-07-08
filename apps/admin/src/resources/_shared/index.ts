/**
 * Shared Resources - Common primitives across all bounded contexts
 */

// Re-export shared components
export * from './components';

// Shared types
export interface Pageable {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface QueryResult<T> {
  data: T;
  pagination?: Pageable;
}
