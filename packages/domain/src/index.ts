/**
 * @pranakaia/domain
 * Core Domain Layer - Pure logic, Types, Entities, and Interfaces
 */

export type {
  Brand,
  BrandedId,
  CarrierId,
  CartId,
  CategoryId,
  Command,
  CommandHandler,
  Currency,
  CustomerId,
  DomainEvent,
  DomainEventHandler,
  DropshipOrderId,
  EntityId,
  EntityIdType,
  EventBusPort,
  EventHandler,
  EventStorePort,
  FulfillmentOrderId,
  InventoryId,
  NotificationId,
  OrderId,
  PaymentId,
  PaymentIntentId,
  ProductId,
  Query,
  QueryHandler,
  RepositoryPort,
  ResultFactory,
  ResultType,
  SessionId,
  ShippingRateId,
  ShippingZoneId,
  Specification,
  SpecificationRepositoryPort,
  StoreId,
  SupplierId,
  TenantId,
  UseCase,
  UserId,
} from '@pranakaia/shared-kernel';
// Re-export Money as MoneyVO
// Re-export SOTA Utilities
// Re-export Branded Identifiers & Helpers
export {
  AggregateRoot,
  AuthenticationError,
  buildQueryString,
  CommandBase,
  ConflictError,
  calculateDiscount,
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
  DomainError,
  DomainEventBase,
  Entity,
  getStockStatus,
  isValidEmail,
  isValidPhone,
  Money as MoneyVO,
  NotFoundError,
  none,
  Option,
  OrderIdHelper,
  ProductIdHelper,
  pluralize,
  QueryBase,
  Result,
  slugify,
  some,
  truncate,
  UnauthorizedError,
  UseCaseBase,
  ValidationError,
  ValueObject,
} from '@pranakaia/shared-kernel';

import type { OrderId, ProductId } from '@pranakaia/shared-kernel';

// Legacy compatibility type aliases
export type OrderIdBrand = OrderId;
export type ProductIdBrand = ProductId;

// Zod schemas for Authentication
import { z } from 'zod';

export const AdminLoginSchema = z.object({
  email: z.string().email('Identificador de Staff inválido'),
  password: z.string().min(6, 'Clave requiere mínimo 6 caracteres'),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
