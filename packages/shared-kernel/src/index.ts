export {
  type AuditAction,
  type AuditLogEntry,
  AuditService,
  type AuditSeverity,
  type AuditWriter,
} from './application/audit.service';
export { GUEST_USER_ID } from './application/constants';
export type {
  Command,
  CommandHandler,
  Query,
  QueryHandler,
  UseCase,
} from './application/index';
export {
  CommandBase,
  QueryBase,
  UseCaseBase,
} from './application/index';
export {
  type Brand,
  BrandedIdError,
  type CarrierId,
  type CartId,
  type CategoryId,
  type Currency,
  type CustomerId,
  createCarrierId,
  createCartId,
  createCategoryId,
  createCurrency,
  createCustomerId,
  createDropshipOrderId,
  createFulfillmentOrderId,
  createInventoryId,
  createNotificationId,
  createOrderId,
  createPaymentId,
  createPaymentIntentId,
  createProductId,
  createSessionId,
  createShippingRateId,
  createShippingZoneId,
  createStoreId,
  createSupplierId,
  createTenantId,
  createUserId,
  type DropshipOrderId,
  type FulfillmentOrderId,
  type InventoryId,
  type NotificationId,
  type OrderId,
  OrderIdHelper,
  type PaymentId,
  type PaymentIntentId,
  type ProductId,
  ProductIdError,
  ProductIdHelper,
  type SessionId,
  type ShippingRateId,
  type ShippingZoneId,
  type StoreId,
  type SupplierId,
  type TenantId,
  type UserId,
} from './branded';
export { AggregateRoot } from './domain/aggregate-root';
export type { DomainEvent, DomainEventHandler } from './domain/domain-event';
export { DomainEventBase } from './domain/domain-event';

export type { BrandedId, EntityId, EntityIdType } from './domain/entity';
export { Entity } from './domain/entity';
export type { EventBusPort, EventHandler, EventStorePort } from './domain/event-bus.port';
export { none, Option, some } from './domain/option';
export type {
  RepositoryPort,
  Specification,
  SpecificationRepositoryPort,
} from './domain/repository.port';
export type { ResultFactory, ResultType } from './domain/result';
export { DomainError, Result } from './domain/result';
export { SafeInteger, type SafeIntegerError as SafeIntegerErrorType } from './domain/safe-integer';
export { ValueObject } from './domain/value-object';

export {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from './domain-error';

export { createEvent } from './events';
export {
  CircuitBreaker,
  type CircuitBreakerOptions,
  CircuitState,
} from './infrastructure/circuit-breaker';
// --- Infrastructure ---
export { InMemoryEventBus } from './infrastructure/in-memory-event-bus';
export {
  type RetryConfig,
  type RetryOptions,
  retry,
  withExponentialBackoff,
} from './infrastructure/retry';
export {
  type CurrencyCode,
  Money,
  MoneyError,
  type MoneyProps,
  VALID_CURRENCIES,
} from './money';
export {
  buildQueryString,
  calculateDiscount,
  clamp,
  getStockStatus,
  isBlank,
  isUUIDv4,
  isValidEmail,
  isValidPhone,
  pluralize,
  randomInt,
  sleep,
  slugify,
  truncate,
} from './utils';
