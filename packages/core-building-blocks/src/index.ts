export type {
  BrandedId,
  DomainEvent,
  DomainEventHandler,
  EntityId,
  EntityIdType,
  EventBusPort,
  EventHandler,
  EventStorePort,
  RepositoryPort,
  Specification,
  SpecificationRepositoryPort,
} from '@pranakaia/shared-kernel';
export {
  AggregateRoot,
  DomainError,
  DomainEventBase,
  Entity,
  none,
  Option,
  Result,
  some,
  ValueObject,
} from '@pranakaia/shared-kernel';
export { DomainService } from './domain-service';
export { InMemoryRepository } from './in-memory-repository';
export {
  RESULT_EXTENSIONS_APPLIED,
  ResultExtensions,
  sequenceResults,
  traverseResults,
} from './result-extensions';
export {
  AndSpecification,
  NotSpecification,
  OrSpecification,
  SpecificationBuilder,
  specBuilder,
} from './specification';
export type { UnitOfWorkPort } from './unit-of-work.port';
export { withUnitOfWork } from './unit-of-work.port';

import './result-extensions';
