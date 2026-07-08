import type { Result } from './result';

/**
 * Base interface for all use cases
 * Each use case represents a single business operation
 */
export interface UseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<Result<TResponse>>;
}
