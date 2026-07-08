/**
 * Application - Shared Kernel Application Layer
 *
 * Patterns for application layer:
 * - Command/CommandHandler: CQRS commands
 * - Query/QueryHandler: CQRS queries
 * - UseCase: Application use cases
 */

export * from './audit.service';
export type { Command, CommandHandler } from './command';
export { CommandBase } from './command';
export * from './constants';
export type { Query, QueryHandler } from './query';
export { QueryBase } from './query';
export type { UseCase } from './use-case';
export { UseCaseBase } from './use-case';
